const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student'); // Import the Student model
require('dotenv').config();

const app = express();
app.use(express.json()); // For parsing JSON

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Admin route for adding a student
app.post('/admin/add-student', async (req, res) => {
  const { name, code, grades } = req.body;

  try {
    const newStudent = new Student({ name, code, grades });
    await newStudent.save();
    res.status(201).json({ message: 'Student added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error adding student' });
  }
});
const fs = require('fs');
const csvParser = require('csv-parser');

app.post('/admin/import-csv', (req, res) => {
  if (!req.files || !req.files.csvFile) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const csvFile = req.files.csvFile;
  const students = [];

  fs.createReadStream(csvFile.tempFilePath)
    .pipe(csvParser())
    .on('data', (row) => {
      students.push(row);
    })
    .on('end', async () => {
      try {
        await Student.insertMany(students);
        res.json({ message: 'CSV data imported successfully' });
      } catch (err) {
        res.status(500).json({ error: 'Error importing CSV data' });
      }
    });
});


// Admin route for updating a student
app.put('/admin/update-student/:code', async (req, res) => {
  const { code } = req.params;
  const { grades } = req.body;

  try {
    const student = await Student.findOneAndUpdate(
      { code },
      { grades },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student updated successfully', student });
  } catch (err) {
    res.status(500).json({ error: 'Error updating student' });
  }
});

// Admin route for deleting a student
app.delete('/admin/delete-student/:code', async (req, res) => {
  const { code } = req.params;

  try {
    const student = await Student.findOneAndDelete({ code });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting student' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
    app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/admin.html'); // Ensure the path is correct
});

});
