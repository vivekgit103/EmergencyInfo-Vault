import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Plus, Edit, Trash2, Eye, EyeOff, Share2, Copy, Check, ExternalLink,
  ShieldAlert, Clock, Key, AlertTriangle, Phone, FileText, QrCode
} from 'lucide-react';
import SensitiveDataNotice from '../components/SensitiveDataNotice';
import Button from '../components/Button';
import ContactFormModal from '../components/ContactFormModal';
import InstructionFormModal from '../components/InstructionFormModal';
import ShareLinkModal from '../components/ShareLinkModal';
import DeleteAccountModal from '../components/DeleteAccountModal';

export default function DashboardPage() {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [contacts, setContacts] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [shareLinks, setShareLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedShareLink, setSelectedShareLink] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Copy indicator state for share links
  const [copiedToken, setCopiedToken] = useState(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState('contacts');

  useEffect(() => {
    document.title = 'Dashboard - EmergencyInfo Vault';
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contactsRes, instructionsRes, linksRes] = await Promise.all([
        api.contacts.getAll(),
        api.instructions.getAll(),
        api.shareLinks.getAll()
      ]);
      setContacts(contactsRes.contacts || []);
      setInstructions(instructionsRes.instructions || []);
      setShareLinks(linksRes.shareLinks || []);
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Failed to load vault records: ' + (err.message || 'Server error') });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback({ type: '', message: '' });
    }, 4000);
  };

  // Contacts handlers
  const handleSaveContact = async (contactData) => {
    if (editingContact) {
      await api.contacts.update(editingContact._id, contactData);
      showToast('Contact updated successfully');
    } else {
      await api.contacts.create(contactData);
      showToast('Contact added successfully');
    }
    setEditingContact(null);
    fetchData();
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Are you sure you want to remove this contact?')) {
      try {
        await api.contacts.delete(id);
        showToast('Contact removed');
        fetchData();
      } catch (err) {
        showToast(err.message || 'Failed to remove contact', 'danger');
      }
    }
  };

  const handleToggleContactVisibility = async (contact) => {
    try {
      await api.contacts.update(contact._id, { showInEmergency: !contact.showInEmergency });
      showToast(`Contact ${!contact.showInEmergency ? 'added to' : 'hidden from'} emergency view`);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to update visibility', 'danger');
    }
  };

  // Instructions handlers
  const handleSaveInstruction = async (instructionData) => {
    if (editingInstruction) {
      await api.instructions.update(editingInstruction._id, instructionData);
      showToast('Instruction updated successfully');
    } else {
      await api.instructions.create(instructionData);
      showToast('Instruction added successfully');
    }
    setEditingInstruction(null);
    fetchData();
  };

  const handleDeleteInstruction = async (id) => {
    if (window.confirm('Are you sure you want to remove this instruction?')) {
      try {
        await api.instructions.delete(id);
        showToast('Instruction removed');
        fetchData();
      } catch (err) {
        showToast(err.message || 'Failed to remove instruction', 'danger');
      }
    }
  };

  const handleToggleInstructionVisibility = async (inst) => {
    try {
      await api.instructions.update(inst._id, { showInEmergency: !inst.showInEmergency });
      showToast(`Instruction ${!inst.showInEmergency ? 'added to' : 'hidden from'} emergency view`);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to update visibility', 'danger');
    }
  };

  // Share link handlers
  const handleGenerateShareLink = async ({ expiry, pin }) => {
    try {
      const res = await api.shareLinks.create({ expiry, pin });
      showToast('Share link created successfully');
      fetchData();
      return res.shareLink;
    } catch (err) {
      showToast(err.message || 'Failed to generate share link', 'danger');
      throw err;
    }
  };

  const handleRevokeShareLink = async (id) => {
    if (window.confirm('Revoke this share link? Responders opening this URL will be informed the link is inactive.')) {
      try {
        await api.shareLinks.revoke(id);
        showToast('Share link revoked');
        fetchData();
      } catch (err) {
        showToast(err.message || 'Failed to revoke link', 'danger');
      }
    }
  };

  const handleCopyLink = (token) => {
    const fullUrl = `${window.location.origin}/e/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    showToast('Link copied to clipboard');
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Account deletion handler
  const handleConfirmDeleteAccount = async (password) => {
    try {
      await deleteAccount(password);
      navigate('/', { replace: true });
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="page-plain-wrap">
      <main id="main-content" style={{ padding: '36px 0 64px' }}>
        <div className="container">
          {/* Dashboard Top Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '4px' }}>Vault Dashboard</h1>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                Owner: <strong>{user?.name}</strong> &bull; Records access controlled
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Button to="/dashboard/preview" variant="secondary">
                <Eye size={18} aria-hidden="true" />
                <span>Preview Responder View</span>
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsShareModalOpen(true)}
              >
                <Share2 size={18} aria-hidden="true" />
                <span>Create Share Link</span>
              </Button>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback.message && (
            <div
              className={`alert ${feedback.type === 'danger' ? 'alert-danger' : 'alert-success'}`}
              role="alert"
              aria-live="polite"
            >
              {feedback.message}
            </div>
          )}

          {/* Sensitive Data Notice */}
          <SensitiveDataNotice />

          {/* Tab Navigation */}
          <div
            role="tablist"
            aria-label="Dashboard Sections"
            style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color)', marginBottom: '24px' }}
          >
            <Button
              role="tab"
              aria-selected={activeTab === 'contacts'}
              onClick={() => setActiveTab('contacts')}
              variant="secondary"
              size="sm"
              style={{
                borderRadius: '8px 8px 0 0',
                borderBottom: activeTab === 'contacts' ? '3px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: activeTab === 'contacts' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'contacts' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: 'none',
                marginBottom: '-2px'
              }}
            >
              <Phone size={16} aria-hidden="true" />
              <span>Emergency Contacts ({contacts.length})</span>
            </Button>

            <Button
              role="tab"
              aria-selected={activeTab === 'instructions'}
              onClick={() => setActiveTab('instructions')}
              variant="secondary"
              size="sm"
              style={{
                borderRadius: '8px 8px 0 0',
                borderBottom: activeTab === 'instructions' ? '3px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: activeTab === 'instructions' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'instructions' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: 'none',
                marginBottom: '-2px'
              }}
            >
              <FileText size={16} aria-hidden="true" />
              <span>Emergency Instructions ({instructions.length})</span>
            </Button>

            <Button
              role="tab"
              aria-selected={activeTab === 'share-links'}
              onClick={() => setActiveTab('share-links')}
              variant="secondary"
              size="sm"
              style={{
                borderRadius: '8px 8px 0 0',
                borderBottom: activeTab === 'share-links' ? '3px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: activeTab === 'share-links' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'share-links' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: 'none',
                marginBottom: '-2px'
              }}
            >
              <Share2 size={16} aria-hidden="true" />
              <span>Share Links ({shareLinks.length})</span>
            </Button>
          </div>

          {/* TAB 1: CONTACTS */}
          {activeTab === 'contacts' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Registered Emergency Contacts</h2>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Sorted automatically by priority (Primary contacts appear at top of emergency card).
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => { setEditingContact(null); setIsContactModalOpen(true); }}
                >
                  <Plus size={16} aria-hidden="true" />
                  <span>Add Contact</span>
                </Button>
              </div>

              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading contacts...</p>
              ) : contacts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '16px' }}>
                    No emergency contacts added yet.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setIsContactModalOpen(true)}
                  >
                    <Plus size={16} aria-hidden="true" />
                    <span>Add First Contact</span>
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {contacts.map((contact) => (
                    <div
                      key={contact._id}
                      className="card"
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        opacity: contact.showInEmergency ? 1 : 0.75,
                        borderLeft: `5px solid ${
                          contact.priority === 'primary' ? 'var(--primary)' : 'var(--border-color)'
                        }`
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '1.125rem' }}>{contact.name}</strong>
                          <span className={`badge badge-${contact.priority}`}>
                            {contact.priority}
                          </span>
                          {!contact.showInEmergency && (
                            <span className="badge badge-other">
                              Hidden from Emergency Card
                            </span>
                          )}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                          <span>{contact.relationship}</span> &bull; <strong>{contact.phone}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleContactVisibility(contact)}
                          title={contact.showInEmergency ? 'Hide from emergency card' : 'Show on emergency card'}
                          aria-label={`Toggle emergency visibility for ${contact.name}`}
                        >
                          {contact.showInEmergency ? <Eye size={16} /> : <EyeOff size={16} />}
                          <span>{contact.showInEmergency ? 'Public' : 'Private'}</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => { setEditingContact(contact); setIsContactModalOpen(true); }}
                          aria-label={`Edit ${contact.name}`}
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteContact(contact._id)}
                          aria-label={`Delete ${contact.name}`}
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Emergency Instructions &amp; Directives</h2>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Short, high-priority instructions for first responders. Maximum 60 chars title, 300 chars text.
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => { setEditingInstruction(null); setIsInstructionModalOpen(true); }}
                >
                  <Plus size={16} aria-hidden="true" />
                  <span>Add Instruction</span>
                </Button>
              </div>

              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading instructions...</p>
              ) : instructions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '16px' }}>
                    No emergency instructions recorded yet.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setIsInstructionModalOpen(true)}
                  >
                    <Plus size={16} aria-hidden="true" />
                    <span>Add First Instruction</span>
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {instructions.map((inst) => (
                    <div
                      key={inst._id}
                      className="card"
                      style={{
                        borderLeft: '5px solid var(--primary)',
                        opacity: inst.showInEmergency ? 1 : 0.75
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '1.125rem', color: 'var(--primary)' }}>{inst.title}</strong>
                          {!inst.showInEmergency && (
                            <span className="badge badge-other">
                              Hidden from Emergency Card
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleInstructionVisibility(inst)}
                            aria-label={`Toggle visibility for instruction ${inst.title}`}
                          >
                            {inst.showInEmergency ? <Eye size={16} /> : <EyeOff size={16} />}
                            <span>{inst.showInEmergency ? 'Public' : 'Private'}</span>
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => { setEditingInstruction(inst); setIsInstructionModalOpen(true); }}
                            aria-label={`Edit instruction ${inst.title}`}
                          >
                            <Edit size={16} />
                            <span>Edit</span>
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteInstruction(inst._id)}
                            aria-label={`Delete instruction ${inst.title}`}
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </div>

                      <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', lineHeight: 1.5 }}>
                        {inst.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SHARE LINKS */}
          {activeTab === 'share-links' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Active and Revoked Share Links</h2>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Each link provides read-only access to your public emergency card until expiration or revocation.
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedShareLink(null);
                    setIsShareModalOpen(true);
                  }}
                >
                  <Plus size={16} aria-hidden="true" />
                  <span>Generate New Link</span>
                </Button>
              </div>

              {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading share links...</p>
              ) : shareLinks.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '16px' }}>
                    No share links generated yet.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedShareLink(null);
                      setIsShareModalOpen(true);
                    }}
                  >
                    <Share2 size={16} aria-hidden="true" />
                    <span>Generate Your First Link</span>
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {shareLinks.map((link) => {
                    const isExpired = new Date(link.expiresAt) < new Date();
                    const isRevoked = link.isRevoked;
                    const isActive = !isExpired && !isRevoked;

                    return (
                      <div
                        key={link._id}
                        className="card"
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '16px',
                          backgroundColor: isActive ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                          borderLeft: `5px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: isActive ? 'var(--badge-primary-bg)' : 'var(--badge-other-bg)',
                                color: isActive ? 'var(--badge-primary-text)' : 'var(--badge-other-text)'
                              }}
                            >
                              {isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Active'}
                            </span>

                            {link.hasPin && (
                              <span className="badge badge-secondary">
                                PIN Protected
                              </span>
                            )}

                            <code style={{ fontSize: '0.875rem', backgroundColor: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>
                              /e/{link.token.slice(0, 8)}...
                            </code>
                          </div>

                          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            <span>Created: {new Date(link.createdAt).toLocaleString()}</span>
                            <span>Expires: {new Date(link.expiresAt).toLocaleString()}</span>
                            <span>Views: {link.accessCount || 0}</span>
                            <span>
                              {link.lastAccessedAt
                                ? `Last viewed: ${new Date(link.lastAccessedAt).toLocaleString()}`
                                : 'Never accessed'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isActive && (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setSelectedShareLink(link);
                                  setIsShareModalOpen(true);
                                }}
                                aria-label="View QR code and printable emergency card"
                              >
                                <QrCode size={16} />
                                <span>QR / Card</span>
                              </Button>

                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleCopyLink(link.token)}
                                aria-label="Copy public link to clipboard"
                              >
                                {copiedToken === link.token ? <Check size={16} color="var(--primary)" /> : <Copy size={16} />}
                                <span>{copiedToken === link.token ? 'Copied' : 'Copy Link'}</span>
                              </Button>

                              <Button
                                to={`/e/${link.token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="secondary"
                                size="sm"
                                aria-label="Open emergency card in new tab"
                              >
                                <ExternalLink size={16} />
                                <span>Open</span>
                              </Button>

                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRevokeShareLink(link._id)}
                                aria-label="Revoke this share link"
                              >
                                <span>Revoke</span>
                              </Button>
                            </>
                          )}
                          {!isActive && (
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                              {isRevoked ? 'Link was revoked by you' : 'Link expired'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Danger Zone: Account Deletion */}
          <div style={{ marginTop: '56px', paddingTop: '32px', borderTop: '2px solid var(--border-color)' }}>
            <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--danger-light)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div>
                  <h3 style={{ color: 'var(--danger)', fontSize: '1.25rem', marginBottom: '4px' }}>
                    Danger Zone: Delete Account
                  </h3>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.9375rem', margin: 0, maxWidth: '600px' }}>
                    Permanently delete your profile, all emergency contacts, instructions, and share links. This action cannot be reversed.
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 size={18} aria-hidden="true" />
                  <span>Delete Account</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ContactFormModal
          isOpen={isContactModalOpen}
          onClose={() => { setIsContactModalOpen(false); setEditingContact(null); }}
          onSubmit={handleSaveContact}
          initialData={editingContact}
        />

        <InstructionFormModal
          isOpen={isInstructionModalOpen}
          onClose={() => { setIsInstructionModalOpen(false); setEditingInstruction(null); }}
          onSubmit={handleSaveInstruction}
          initialData={editingInstruction}
        />

        <ShareLinkModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setSelectedShareLink(null);
          }}
          onGenerate={handleGenerateShareLink}
          initialLink={selectedShareLink}
        />

        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDeleteAccount}
        />
      </main>
    </div>
  );
}
