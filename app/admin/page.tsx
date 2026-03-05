"use client";
import { useState } from "react";

export default function AdminPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user" });

  const handleCreate = async () => {
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    if (res.ok) alert("ইউজার তৈরি হয়েছে!");
    else alert("কিছু ভুল হয়েছে!");
  };

  return (
    <div style={{ padding: "50px" }}>
      <h1>Admin Panel - Create User</h1>
      <input type="text" placeholder="Name" onChange={(e) => setFormData({...formData, name: e.target.value})} /><br/>
      <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} /><br/>
      <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} /><br/>
      <select onChange={(e) => setFormData({...formData, role: e.target.value})}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select><br/>
      <button onClick={handleCreate}>Create User</button>
    </div>
  );
}