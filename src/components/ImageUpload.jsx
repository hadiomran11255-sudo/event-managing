import { useState } from 'react';
import { uploadPhoto } from '../api/eventApi.js';
import React from 'react';


export default function ImageUpload({ label, value, onChange, multiple = false }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      if (multiple) {
        const uploaded = [];
        for (const file of files) {
          uploaded.push(await uploadPhoto(file));
        }
        onChange([...(value || []), ...uploaded]);
      } else {
        const uploaded = await uploadPhoto(files[0]);
        onChange(uploaded);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const items = multiple ? value || [] : value?.url ? [value] : [];

  return (
    <div className="field">
      <label>{label}</label>
      <input type="file" accept="image/*" multiple={multiple} onChange={handleUpload} />
      {uploading && <small>Uploading...</small>}
      <div className="preview-grid">
        {items.map((item, index) => (
          <div className="preview" key={`${item.url}-${index}`}>
            <img src={item.url} alt={item.filename || 'Uploaded'} />
            {multiple && (
              <button
                type="button"
                className="small-danger"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
