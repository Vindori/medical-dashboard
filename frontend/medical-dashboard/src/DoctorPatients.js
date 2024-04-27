import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Paper, Typography, Collapse, Divider, TextField, Button } from '@mui/material';
import axios from 'axios';

function DoctorPatients({ doctorId, doctorName }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [editData, setEditData] = useState({});

  useEffect(() => {
    axios.get(`http://localhost:3000/patients/${doctorId}`)
      .then(response => {
        setPatients(response.data);
        setSelectedPatientId(null);
      })
      .catch(error => console.error('Error fetching patients:', error));
  }, [doctorId]);

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(selectedPatientId === patientId ? null : patientId);
    setEditMode({});
  };

  const handleEditClick = (patient) => {
    setEditMode({ [patient._id]: true });
    setEditData(patient);
  };

  const handleChange = (prop, value) => {
    setEditData({ ...editData, [prop]: value });
  };

  const handleSubmit = async (patientId) => {
    try {
      await axios.put(`http://localhost:3000/patient/${patientId}`, editData);
      const updatedPatients = patients.map(p => p._id === patientId ? { ...p, ...editData } : p);
      setPatients(updatedPatients);
      setEditMode({});
  
      // Обновить список пациентов
      axios.get(`http://localhost:3000/patients/${doctorId}`)
        .then(response => {
          setPatients(response.data);
          setSelectedPatientId(null);
        })
        .catch(error => console.error('Error fetching patients:', error));
    } catch (error) {
      console.error('Failed to update patient:', error);
    }
  };
  
  return (
    <Paper style={{ margin: '16px', padding: '16px' }}>
      <Typography variant="h5" style={{ marginBottom: '12px' }}>{doctorName}</Typography>
      <List>
        {patients.map((patient) => (
          <>
            <ListItem button key={patient._id} onClick={() => handleSelectPatient(patient._id)}>
              <ListItemText primary={patient.name} secondary={`Email: ${patient.email}`} />
            </ListItem>
            <Collapse in={selectedPatientId === patient._id} timeout="auto" unmountOnExit>
              <Divider />
              {editMode[patient._id] ? (
                <>
                  <TextField
                    label="Name"
                    variant="standard"
                    value={editData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    style={{ margin: '10px' }}
                  />
                  <TextField
                    label="Age"
                    type="number"
                    variant="standard"
                    value={editData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    style={{ margin: '10px' }}
                  />
                  <TextField
                    label="Address"
                    variant="standard"
                    value={editData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    style={{ margin: '10px' }}
                  />
                  <TextField
                    label="Email"
                    variant="standard"
                    value={editData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    style={{ margin: '10px' }}
                  />
                  <Button onClick={() => handleSubmit(patient._id)} color="primary">
                    Save
                  </Button>
                  <Button onClick={() => setEditMode({})} color="secondary">
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body2" style={{ margin: '10px' }}>
                    Name: {patient.name}
                  </Typography>
                  <Typography variant="body2" style={{ margin: '10px' }}>
                    Age: {patient.age}
                  </Typography>
                  <Typography variant="body2" style={{ margin: '10px' }}>
                    Address: {patient.address}
                  </Typography>
                  <Typography variant="body2" style={{ margin: '10px' }}>
                    Email: {patient.email}
                  </Typography>
                  <Button onClick={() => handleEditClick(patient)} color="primary">
                    Edit
                  </Button>
                </>
              )}
            </Collapse>
          </>
        ))}
      </List>
    </Paper>
  );
}

export default DoctorPatients;
