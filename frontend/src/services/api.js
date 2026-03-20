import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export async function uploadReport({ patientId, doctor, file }) {
  const formData = new FormData();
  formData.append('patientId', patientId);
  formData.append('doctor', doctor);
  formData.append('report', file);

  const res = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function verifyReport({ patientId, file }) {
  const formData = new FormData();
  formData.append('patientId', patientId);
  formData.append('report', file);

  const res = await axios.post(`${API_BASE}/verify`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
