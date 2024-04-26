import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import axios from 'axios';

function DoctorPatients({ doctorId, doctorName }) {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3000/patients/${doctorId}`)
      .then(response => setPatients(response.data))
      .catch(error => console.error('Error fetching patients:', error));
  }, [doctorId]);

  return (
    <Paper style={{ margin: '16px', padding: '16px' }}>
    <Typography variant="h5" style={{ marginBottom: '12px' }}>{doctorName}</Typography>
      <List>
        {patients.map((patient) => (
          <ListItem key={patient._id}>
            <ListItemText primary={patient.name} secondary={`Email: ${patient.email}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default DoctorPatients;
