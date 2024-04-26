import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';

function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/doctors')
      .then(response => response.json())
      .then(data => setDoctors(data))
      .catch(error => console.error('Error fetching doctors:', error));
  }, []);

  return (
    <Paper style={{ margin: '16px', padding: '16px' }}>
      <Typography variant="h5" style={{ marginBottom: '12px' }}>Doctors</Typography>
      <List>
        {doctors.map(doctor => (
          <ListItem>
            <ListItemText primary={doctor.name} secondary={`${doctor.specialization}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default Doctors;
