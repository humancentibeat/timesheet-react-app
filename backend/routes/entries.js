const express = require('express');
const router = express.Router();
const Entry = require('../models/entry');

// Add or Update Entry
router.post('/', async (req, res) => {
  const { user, date, type, startHour, endHour, hours } = req.body;
  console.log('Received request body:', req.body); // Add logging

  try {
    const entry = new Entry({ user, date, type, startHour, endHour, hours });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error('Error creating entry:', err); // Log the error
    res.status(500).json({ error: err.message });
  }
});

// Get Entries
router.get('/', async (req, res) => {
  console.log('GET /api/entries called');
  try {
    const entries = await Entry.find();
    res.json(entries);
  } catch (err) {
    console.error('Error fetching entries:', err); // Log the error
    res.status(500).json({ error: err.message });
  }
});

// Update Entry
router.put('/:id', async (req, res) => {
  console.log('PUT /api/entries/:id called with body:', req.body); // Add logging
  try {
    const updatedEntry = await Entry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEntry);
  } catch (err) {
    console.error('Error updating entry:', err); // Log the error
    res.status(500).json({ error: err.message });
  }
});

// Delete Entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' }); // Return JSON
    res.json({ message: 'Entry deleted', id: req.params.id }); // Return JSON
  } catch (err) {
    console.error('Error deleting entry:', err); // Log the error
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
