const ContactForm = require('../models/ContactForm');
const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create contact transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

// Submit contact form
exports.submitContactForm = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, category } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const contactForm = new ContactForm({
      name,
      email,
      phone,
      subject,
      message,
      category,
      userId: req.user?.userId || null,
      status: 'new',
    });

    await contactForm.save();

    // Send confirmation email to user
    await transporter.sendMail({
      from: config.email.user,
      to: email,
      subject: 'We received your message - Optimus AI',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>We have received your message and will get back to you shortly.</p>
        <p><strong>Your message ID:</strong> ${contactForm._id}</p>
        <p><strong>Category:</strong> ${category}</p>
      `,
    });

    // Send notification to admin
    await transporter.sendMail({
      from: config.email.user,
      to: config.admin.email,
      subject: `New Contact Form Submission - ${category}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Category:</strong> ${category}</p>
        <a href="${config.frontendUrl}/admin/contact-forms/${contactForm._id}">View in Admin Panel</a>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      formId: contactForm._id,
    });
  } catch (error) {
    next(error);
  }
};

// Get contact forms (admin only)
exports.getContactForms = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (page - 1) * limit;

    const contactForms = await ContactForm.find(query)
      .populate('userId', 'email firstName lastName')
      .populate('assignedTo', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ContactForm.countDocuments(query);

    res.json({
      success: true,
      contactForms,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single contact form
exports.getContactForm = async (req, res, next) => {
  try {
    const contactForm = await ContactForm.findById(req.params.id)
      .populate('userId', 'email firstName lastName')
      .populate('assignedTo', 'email firstName lastName')
      .populate('responses.respondentId', 'email firstName lastName');

    if (!contactForm) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found',
      });
    }

    contactForm.isRead = true;
    await contactForm.save();

    res.json({
      success: true,
      contactForm,
    });
  } catch (error) {
    next(error);
  }
};

// Update contact form status
exports.updateContactFormStatus = async (req, res, next) => {
  try {
    const { status, priority, assignedTo } = req.body;

    const contactForm = await ContactForm.findByIdAndUpdate(
      req.params.id,
      { status, priority, assignedTo },
      { new: true }
    ).populate('userId assignedTo');

    res.json({
      success: true,
      message: 'Contact form updated',
      contactForm,
    });
  } catch (error) {
    next(error);
  }
};

// Add response to contact form
exports.addContactFormResponse = async (req, res, next) => {
  try {
    const { message } = req.body;

    const contactForm = await ContactForm.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          responses: {
            respondentId: req.user.userId,
            message,
          },
        },
      },
      { new: true }
    );

    // Send email to user
    await transporter.sendMail({
      from: config.email.user,
      to: contactForm.email,
      subject: `Response to your message - Optimus AI`,
      html: `
        <h2>We have responded to your inquiry</h2>
        <p><strong>Response:</strong></p>
        <p>${message}</p>
        <p>Message ID: ${contactForm._id}</p>
      `,
    });

    res.json({
      success: true,
      message: 'Response added successfully',
      contactForm,
    });
  } catch (error) {
    next(error);
  }
};
