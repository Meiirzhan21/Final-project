// src/pages/api-test.js
"use client";
import { useState } from 'react';
import api from '../utils/api';

export default function ApiTest() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleTest = async () => {
    try {
      const response = await api.get('/');
      setMessage(response.data);
    } catch (err) {
      setError('Ошибка при подключении к API');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🔌 API Test</h1>
      <button onClick={handleTest} style={{ padding: '10px', fontSize: '16px' }}>
        Проверить соединение
      </button>
      {message && <p style={{ color: 'green' }}>Ответ: {message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
