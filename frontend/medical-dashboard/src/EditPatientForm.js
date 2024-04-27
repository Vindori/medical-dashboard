import React, { useState } from 'react';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';

function EditPatientForm({ patient, onClose }) {
  const [formData, setFormData] = useState({
    name: patient.name,
    age: patient.age,
    address: patient.address,
    email: patient.email
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`http://localhost:3000/patients/${patient._id}`, formData);
      onClose(true); // Передайте true, если данные были успешно обновлены
    } catch (error) {
      console.error('Failed to update patient', error);
      onClose(false);
    }
  };

  return (
    <Dialog open={true} onClose={() => onClose(false)}>
      <DialogTitle>Edit Patient</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          variant="outlined"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Age"
          type="number"
          fullWidth
          variant="outlined"
          name="age"
          value={formData.age}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Address"
          type="text"
          fullWidth
          variant="outlined"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditPatientForm;
