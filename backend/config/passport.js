const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/User');
const config = require('./config');

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
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
        const user = await User.findOne({ email }).select('+password');

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
        let user = await User.findOne({ 'oauth.googleId': profile.id });

        if (!user) {
          user = new User({
            email: profile.emails[0].value,
            firstName: profile.given_name || profile.displayName,
            lastName: profile.family_name || '',
            oauth: {
              googleId: profile.id,
              googleProfile: profile,
            },
            isEmailVerified: true,
          });

          await user.save();
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
        let user = await User.findOne({ 'oauth.githubId': profile.id });

        if (!user) {
          const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
          user = new User({
            email,
            firstName: profile.displayName || profile.username,
            lastName: '',
            oauth: {
              githubId: profile.id,
              githubProfile: profile,
            },
            isEmailVerified: !!profile.emails?.[0]?.value,
          });

          await user.save();
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
        const user = await User.findById(payload.userId);

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
