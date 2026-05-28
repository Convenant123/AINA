import React from 'react';
import DoctorDashboard from '../components/Doctor/DoctorDashboard';

export default function DoctorPage({ user }) {
  return <DoctorDashboard user={user} />;
}
