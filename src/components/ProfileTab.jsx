import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import '../css/ProfileCard.css'

export default function ProfileTab({ activeTab, setActiveTab }) {

  const [profiles, setProfiles] = useState([]);
  const firstRenderRef = useRef(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    id: '',
    name: '',
    profilePic: '',
    address: '',
    email: '',
    phone: '',
    company: ''
  });
  const [editingProfileId, setEditingProfileId] = useState(null);

  // ✅ Load Profiles from Local Storage on Mount
  useEffect(() => {
   
    const storedProfiles = localStorage.getItem('profiles');
    if (storedProfiles) {
      setProfiles(JSON.parse(storedProfiles));
    }
  }, []);

  // ✅ Save Profiles to Local Storage whenever profiles change
  useEffect(() => {
 if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    localStorage.setItem('profiles', JSON.stringify(profiles));
  }, [profiles]);

  const handleAddProfile = (e) => {
    e.preventDefault();
    if (profileForm.name.trim()) {
      if (editingProfileId) {
        setProfiles(prev =>
          prev.map(p => p.id === editingProfileId ? { ...profileForm, id: editingProfileId } : p)
        );
        setEditingProfileId(null);
      } else {
        setProfiles(prev => [...prev, { ...profileForm, id: uuidv4() }]);
      }
      setProfileForm({ id: '', name: '', profilePic: '', address: '', email: '', phone: '', company: '' });
      setShowProfileForm(false);
    }
  };

  const handleEditProfile = (profile) => {
    setEditingProfileId(profile.id);
    setProfileForm(profile);
    setShowProfileForm(true);
  };

  const handleDeleteProfile = (id) => {
    if (window.confirm('Are you sure to delete this profile?')) {
      setProfiles(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div>
      {activeTab === 'profiles' && (
        <div>
          <button onClick={() => setShowProfileForm(true)} className="btn toggle-form">➕ Create Profile</button>

          {showProfileForm && (
            <div className="custom-popup-overlay">
              <div className="custom-popup">
                <h3>{editingProfileId ? '✏️ Edit Profile' : '➕ Create Profile'}</h3>

                <input placeholder="Name" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                <input placeholder="Profile Pic URL" value={profileForm.profilePic} onChange={e => setProfileForm({ ...profileForm, profilePic: e.target.value })} />
                <input placeholder="Address" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} />
                <input placeholder="Email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                <input placeholder="Phone" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                <input placeholder="Company" value={profileForm.company} onChange={e => setProfileForm({ ...profileForm, company: e.target.value })} />

                <div className="popup-buttons">
                  <button className="btn" onClick={handleAddProfile}>✔ Save</button>
                  <button className="btn delete-btn" onClick={() => { setShowProfileForm(false); setEditingProfileId(null); }}>✖ Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="profile-grid">
            {profiles.map(p => (
             <div key={p.id} className="supplier-card">
  <img src={p.profilePic || 'https://via.placeholder.com/100'} alt="Profile" />
  <div className="supplier-card-content">
    <h3>{p.name}</h3>
    <p><strong>Address:</strong> {p.address}</p>
    <p><strong>Email:</strong> {p.email}</p>
    <p><strong>Phone:</strong> {p.phone}</p>
    <p><strong>Company:</strong> {p.company}</p>
    <div>
      <button onClick={() => handleEditProfile(p)} className="btn edit-btn">✏ Edit</button>
      <button onClick={() => handleDeleteProfile(p.id)} className="btn delete-btn">🗑 Delete</button>
    </div>
  </div>
</div>

            ))}
          </div>
        </div>
      )}
    </div>
  );
}
