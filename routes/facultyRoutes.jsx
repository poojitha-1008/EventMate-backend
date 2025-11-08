import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FacultyProfile.css';

const FacultyProfile = () => {
  const [userData, setUserData] = useState({
    name: '',
    department: '',
    email: '',
    designation: '',
    phone: '',
    office: '',
    joiningDate: '',
    profileImage: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/faculty/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Error fetching profile data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/faculty/profile', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/faculty/profile-image', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUserData(prev => ({ ...prev, profileImage: response.data.profileImage }));
      setMessage('Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage('Error uploading image');
    }
  };

  return (
    <div className="faculty-profile">
      <div className="profile-header">
        <h1>Faculty Profile</h1>
        {message && <div className="message">{message}</div>}
      </div>

      <div className="profile-content">
        <div className="profile-image-section">
          <div className="image-container">
            <img 
              src={userData.profileImage || '/default-avatar.png'} 
              alt="Profile" 
              className="profile-image"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="image-upload-input"
              id="profileImage"
            />
            <label htmlFor="profileImage" className="image-upload-label">
              Change Photo
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={userData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <input
              type="text"
              id="department"
              name="department"
              value={userData.department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="designation">Designation</label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={userData.designation}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={userData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="office">Office</label>
            <input
              type="text"
              id="office"
              name="office"
              value={userData.office}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="joiningDate">Joining Date</label>
            <input
              type="date"
              id="joiningDate"
              name="joiningDate"
              value={userData.joiningDate}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FacultyProfile;