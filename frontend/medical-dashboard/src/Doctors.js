import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import axios from 'axios';

function Doctors({ onSelectDoctor }) {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/doctors')
      .then(response => setDoctors(response.data))
      .catch(error => console.error('Error fetching doctors:', error));
  }, []);

  return (
    <Paper style={{ margin: '16px', padding: '16px' }}>
    <Typography variant="h5" style={{ marginBottom: '12px' }}>Doctors</Typography>
      <List>
        {doctors.map((doctor) => (
          <ListItem button key={doctor._id} onClick={() => onSelectDoctor(doctor)}>
            <ListItemText primary={doctor.name} secondary={doctor.specialization} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default Doctors;
