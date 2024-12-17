import React, { useState } from 'react';
import logoImg from "../../../src/assets/logo.png";
import "./Login.css";
import { TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { signup  } from "../../config/firebase";

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();
        signup(name,email,password);
    }

    const clickHandler = () => {
        navigate('/login');
    }

    return (
        <div className='loginPage'>
            <img src={logoImg} alt='logo-picture' className='logo' />
            <form
                onSubmit={submitHandler}
                style={{
                    backgroundColor: 'rgba(45, 45, 45, 0.5)',
                    padding: '2rem',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                    maxWidth: '400px',
                    color: 'white',
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: 'center',
                        marginBottom: '1rem',
                        fontWeight: 'bold',
                        color: '#ffffff'
                    }}
                >
                    Sign Up
                </Typography>

                {['Username', 'Email', 'Password'].map((label) => (
                    <TextField
                        key={label}
                        required
                        label={label}
                        type={label === 'Password' ? 'password' : 'text'}
                        size="medium"
                        autoComplete='off'
                        value={label === 'Username' ? name : label === 'Email' ? email : password} // Bind state to value
                        onChange={(e) =>
                            label === 'Username'
                                ? setName(e.target.value)
                                : label === 'Email'
                                    ? setEmail(e.target.value)
                                    : setPassword(e.target.value)
                        }
                        sx={{
                            marginBottom: 2,
                            width: '100%',
                            '& .MuiInputLabel-root': { color: '#ffffff' },
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'transparent',
                                borderRadius: '5px',
                                '& fieldset': { borderColor: '#4A4A4A' },
                                '&:hover fieldset': {
                                    borderColor: '#80B3D7',
                                    boxShadow: '0 0 8px rgba(128, 179, 215, 0.5)',
                                },
                                '&.Mui-focused fieldset': { borderColor: '#80B3D7' },
                                '& input': { color: '#ffffff' },
                            },
                        }}
                    />
                ))}

                <Button
                    variant="contained"
                    size="large"
                    type="submit"
                    sx={{
                        width: '100%',
                        background: 'linear-gradient(90deg, #4A90D9, #80B3D7)',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                            background: 'linear-gradient(90deg, #357ABD, #639ECF)',
                        },
                    }}
                >
                    Create Account
                </Button>

                <FormControlLabel
                    control={<Checkbox sx={{ color: '#ffffff' }} />}
                    label={
                        <Typography sx={{ fontSize: '0.875rem', color: '#ffffff', lineHeight: 1.5 }}>
                            Agree to the terms of use & privacy policy.
                        </Typography>
                    }
                    sx={{
                        marginTop: 2,
                        '& .MuiCheckbox-root': {
                            color: '#ffffff',
                            '&.Mui-checked': { color: '#80B3D7' },
                        },
                    }}
                />

                <p style={{ textAlign: 'center', color: '#ffffff', marginTop: '1rem' }}>
                    Already have an account?{' '}
                    <span
                        onClick={clickHandler}
                        style={{
                            color: '#80B3D7',
                            cursor: 'pointer',
                            textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                    >
                        Click Here
                    </span>
                </p>
            </form>
        </div>
    );
}

export default Signup;
