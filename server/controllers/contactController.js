const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');

// Priority weight helper for custom sorting
const priorityOrder = { primary: 1, secondary: 2, other: 3 };

/**
 * @desc    Get all contacts for current user
 * @route   GET /api/contacts
 * @access  Private
 */
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ userId: req.user._id }).sort({ createdAt: -1 });

  // Sort by priority order: primary, secondary, other
  const sorted = contacts.sort((a, b) => {
    return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
  });

  res.status(200).json({
    contacts: sorted
  });
});

/**
 * @desc    Create a new emergency contact
 * @route   POST /api/contacts
 * @access  Private
 */
const createContact = asyncHandler(async (req, res) => {
  const { name, relationship, phone, priority, showInEmergency } = req.body;

  const contact = await Contact.create({
    userId: req.user._id,
    name,
    relationship,
    phone,
    priority: priority || 'primary',
    showInEmergency: showInEmergency !== undefined ? Boolean(showInEmergency) : true
  });

  res.status(201).json({
    message: 'Emergency contact added successfully',
    contact
  });
});

/**
 * @desc    Update an emergency contact
 * @route   PUT /api/contacts/:id
 * @access  Private
 */
const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, userId: req.user._id });

  if (!contact) {
    return res.status(404).json({
      message: 'Contact not found or you do not have permission to edit it'
    });
  }

  const { name, relationship, phone, priority, showInEmergency } = req.body;

  if (name !== undefined) contact.name = name;
  if (relationship !== undefined) contact.relationship = relationship;
  if (phone !== undefined) contact.phone = phone;
  if (priority !== undefined) contact.priority = priority;
  if (showInEmergency !== undefined) contact.showInEmergency = Boolean(showInEmergency);

  const updatedContact = await contact.save();

  res.status(200).json({
    message: 'Emergency contact updated successfully',
    contact: updatedContact
  });
});

/**
 * @desc    Delete an emergency contact
 * @route   DELETE /api/contacts/:id
 * @access  Private
 */
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id, userId: req.user._id });

  if (!contact) {
    return res.status(404).json({
      message: 'Contact not found or you do not have permission to delete it'
    });
  }

  await Contact.deleteOne({ _id: contact._id });

  res.status(200).json({
    message: 'Emergency contact removed successfully',
    id: req.params.id
  });
});

module.exports = {
  getContacts,
  createContact,
  updateContact,
  deleteContact
};
