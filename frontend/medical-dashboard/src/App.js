import React, { useState } from 'react';
import Patients from './Patients';
import Doctors from './Doctors';
import DoctorPatients from './DoctorPatients';
import { CssBaseline, Container, Grid, Typography } from '@mui/material';

function App() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" style={{ margin: '20px 0' }}>Medical Dashboard</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Patients />
          </Grid>
          <Grid item xs={12} md={4}>
            <Doctors onSelectDoctor={handleDoctorSelect} />
          </Grid>
          <Grid item xs={12} md={4}>
            {selectedDoctor && (
              <>
                <DoctorPatients doctorId={selectedDoctor._id} doctorName={selectedDoctor.name} />
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default App;
