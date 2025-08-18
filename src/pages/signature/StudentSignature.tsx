import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../services/axios.config';
import './StudentSignature.css';

const StudentSignature: React.FC = () => {
  const { user, updateUser } = useAuth();
  const signatureInputRef = useRef<HTMLInputElement>(null);
  
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string>('');
  const [currentSignature, setCurrentSignature] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCurrentSignature();
  }, []);

  const fetchCurrentSignature = async () => {
    try {
      const response = await axios.get('/me/');
      const userData = response.data;
      if (userData.signature) {
        const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:8000';
        const signatureUrl = userData.signature.startsWith('http') 
          ? userData.signature 
          : `${baseUrl}${userData.signature}`;
        setCurrentSignature(signatureUrl);
      } else {
        setCurrentSignature('');
      }
    } catch (err) {
      console.error('Error fetching current signature:', err);
    }
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setSignatureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setSignaturePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const handleUploadSignature = async () => {
    if (!signatureFile) {
      setError('Please select a signature image');
      return;
    }

    // If user already has a signature, confirm replacement
    if (currentSignature) {
      if (!window.confirm('You already have a signature uploaded. Do you want to replace it with the new one?')) {
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('signature', signatureFile);

      const response = await axios.patch('/me/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(currentSignature ? 'Signature replaced successfully!' : 'Signature uploaded successfully!');
      setSignatureFile(null);
      setSignaturePreview('');
      
      // Reset file input
      if (signatureInputRef.current) {
        signatureInputRef.current.value = '';
      }
      
      // Update user in context
      updateUser(response.data);
      
      // Fetch the updated signature from server
      await fetchCurrentSignature();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error uploading signature:', err);
      setError(err.response?.data?.detail || 'Failed to upload signature');
      
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSignature = async () => {
    if (!window.confirm('Are you sure you want to remove your signature?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Send null signature to remove it (use JSON instead of FormData for removal)
      const response = await axios.patch('/me/', {
        signature: null
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setSuccess('Signature removed successfully!');
      setCurrentSignature('');
      
      // Update user in context
      updateUser(response.data);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error removing signature:', err);
      setError(err.response?.data?.detail || 'Failed to remove signature');
      
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Only allow students
  if (!user || user.user_type !== 'student') {
    return (
      <div className="student-signature-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>This page is only accessible to students.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-signature-container">
      <div className="signature-header">
        <h1>Upload Your Signature</h1>
        <p>Add your digital signature to your course registration forms</p>
      </div>

      <div className="signature-content">
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <span>✅</span>
            <strong>Success:</strong> {success}
          </div>
        )}

        {/* Current Signature Display */}
        <div className="current-signature-section">
          <h2>Current Signature</h2>
          
          {currentSignature ? (
            <div className="signature-display">
              <div className="signature-frame">
                <img src={currentSignature} alt="Your signature" />
              </div>
              <div className="signature-actions">
                <button
                  onClick={handleRemoveSignature}
                  disabled={loading}
                  className="remove-signature-btn"
                >
                  🗑️ Remove Signature
                </button>
              </div>
            </div>
          ) : (
            <div className="no-signature">
              <div className="no-signature-icon">✍️</div>
              <h3>No signature uploaded</h3>
              <p>Upload your signature to have it appear on your printed course forms</p>
            </div>
          )}
        </div>

        {/* Upload New Signature */}
        <div className="upload-signature-section">
          <h2>{currentSignature ? 'Replace Signature' : 'Upload New Signature'}</h2>
          
          <div className="upload-area">
            <input
              ref={signatureInputRef}
              type="file"
              accept="image/*"
              onChange={handleSignatureChange}
              style={{ display: 'none' }}
            />
            
            <button
              type="button"
              onClick={() => signatureInputRef.current?.click()}
              className="select-file-btn"
              disabled={loading}
            >
              📁 {currentSignature ? 'Select New Signature Image' : 'Select Signature Image'}
            </button>

            {signaturePreview && (
              <div className="signature-preview-section">
                <h3>Preview:</h3>
                <div className="signature-preview">
                  <img src={signaturePreview} alt="Signature preview" />
                </div>
                <div className="preview-actions">
                  <button
                    type="button"
                    onClick={handleUploadSignature}
                    disabled={loading}
                    className="upload-btn"
                  >
                    {loading ? '⏳ Uploading...' : currentSignature ? '🔄 Replace Signature' : '💾 Upload Signature'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureFile(null);
                      setSignaturePreview('');
                      if (signatureInputRef.current) {
                        signatureInputRef.current.value = '';
                      }
                    }}
                    className="cancel-btn"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Guidelines */}
        <div className="guidelines-section">
          <h3>📋 Upload Guidelines</h3>
          <div className="guidelines-content">
            <div className="guideline-item">
              <span className="guideline-icon">📝</span>
              <div>
                <strong>Clear Image:</strong> Upload a clear, high-quality image of your signature
              </div>
            </div>
            <div className="guideline-item">
              <span className="guideline-icon">🖼️</span>
              <div>
                <strong>File Format:</strong> Supported formats are JPG, PNG, and GIF
              </div>
            </div>
            <div className="guideline-item">
              <span className="guideline-icon">📏</span>
              <div>
                <strong>File Size:</strong> Maximum file size is 5MB
              </div>
            </div>
            <div className="guideline-item">
              <span className="guideline-icon">🎨</span>
              <div>
                <strong>Background:</strong> For best results, use a transparent or white background
              </div>
            </div>
            <div className="guideline-item">
              <span className="guideline-icon">📄</span>
              <div>
                <strong>Usage:</strong> Your signature will appear on printed course registration forms
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="how-it-works-section">
          <h3>🔄 How It Works</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <strong>Upload:</strong> Select and upload your signature image
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <strong>Approve:</strong> Get your course registration approved by staff
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <strong>Print:</strong> Your signature appears automatically on the printed form
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSignature; 