const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const config = require('./config');

// Lazy load User model to avoid circular dependencies
let User;
const getUser = () => {
  if (!User) {
    User = require('../models').User;
  }
  return User;
};

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUser().findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Local Strategy (Email/Password)
passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await getUser().findOne({ where: { email } });

        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.oauth2.google.clientId,
      clientSecret: config.oauth2.google.clientSecret,
      callbackURL: config.oauth2.google.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Try to find user by Google ID
        let user = await getUser().findOne({ 
          where: {
            googleId: profile.id
          }
        });

        if (!user) {
          // Try to find by email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await getUser().findOne({ where: { email } });
          }

          if (!user) {
            // Create new user
            user = await getUser().create({
              email: profile.emails?.[0]?.value || `${profile.id}@google.local`,
              firstName: profile.given_name || profile.displayName?.split(' ')[0] || 'User',
              lastName: profile.family_name || profile.displayName?.split(' ')[1] || '',
              googleId: profile.id,
              googleProfile: JSON.stringify(profile),
              isEmailVerified: true, // Auto-verify users from OAuth
            });
          } else {
            // Link existing user with Google account
            await user.update({ 
              googleId: profile.id,
              googleProfile: JSON.stringify(profile),
            });
          }
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: config.oauth2.github.clientId,
      clientSecret: config.oauth2.github.clientSecret,
      callbackURL: config.oauth2.github.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Try to find user by GitHub ID
        let user = await getUser().findOne({ 
          where: {
            githubId: profile.id
          }
        });

        if (!user) {
          // Try to find by email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await getUser().findOne({ where: { email } });
          }

          if (!user) {
            // Create new user
            user = await getUser().create({
              email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
              firstName: profile.displayName || profile.username || 'User',
              lastName: '',
              githubId: profile.id,
              githubProfile: JSON.stringify(profile),
              isEmailVerified: !!profile.emails?.[0]?.value, // Only auto-verify if email is public
            });
          } else {
            // Link existing user with GitHub account
            await user.update({ 
              githubId: profile.id,
              githubProfile: JSON.stringify(profile),
            });
          }
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

// JWT Strategy
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwtSecret,
    },
    async (payload, done) => {
      try {
        const user = await getUser().findByPk(payload.userId);

        if (!user) {
          return done(null, false);
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

module.exports = passport;
