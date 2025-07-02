// components/LoginForm.js
import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const LoginForm = ({onSuccesAccess, onCancel}: {onSuccesAccess: () => void; onCancel: () => void}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para verificar la contraseña
    if (password === '1234') {
      onSuccesAccess()
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Acceso</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <Lock style={{ marginRight: '10px' }} />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#0070f3', color: '#fff' }}>
          Iniciar Sesión
        </button>
        <br />
        <br />
        <button
        onClick={onCancel} 
        type="button"
        >
          Regresar
        </button>
      </form>
    </div>
  );
};

export default LoginForm;