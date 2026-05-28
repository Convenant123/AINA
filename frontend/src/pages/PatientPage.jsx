import React from 'react';
import PatientDashboard from '../components/Patient/PatientDashboard';

export default function PatientPage({ user }) {
  return <PatientDashboard user={user} />;
}
