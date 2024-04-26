import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';

function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/patients')
      .then(response => response.json())
      .then(data => setPatients(data))
      .catch(error => console.error('Error fetching patients:', error));
  }, []);

  return (
    <Paper style={{ margin: '16px', padding: '16px' }}>
      <Typography variant="h5" style={{ marginBottom: '12px' }}>Patients</Typography>
      <List>
        {patients.map(patient => (
          <ListItem key={patient._id}>
            <ListItemText primary={patient.name} secondary={`${patient.age} years old`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default Patients;
