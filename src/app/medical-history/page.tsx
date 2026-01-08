"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { authApi, medicalHistoryApi } from "@/lib/api";
import { MedicalHistoryEvent } from "@/types/medical.types";

// Form-state types aligned with MedicalHistoryEvent while allowing optional IDs for new entries
type FormTreatment = {
  treatmentId?: string;
  type: string;
  medicineName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  procedureName?: string;
  notes?: string;
  startedOn: string;
  endedOn?: string;
};

type FormFollowUp = {
  date: string;
  notes: string;
  nextVisit?: string;
};

type FormDocument = {
  type: string;
  url: string;
};

type MedicalEventFormData = {
  conditionName: string;
  conditionType: string;
  severity: string;
  description: string;
  diagnosedOn: string;
  affectedBodyPart: string;
  status: string;
  diagnosedBy: {
    doctorId?: string;
    doctorName: string;
    hospital: string;
  };
  treatments: FormTreatment[];
  followUps: FormFollowUp[];
  documents: FormDocument[];
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryEvent[]>(
    []
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const [formData, setFormData] = useState<MedicalEventFormData>({
    conditionName: "",
    conditionType: "",
    severity: "Mild",
    description: "",
    diagnosedOn: "",
    affectedBodyPart: "",
    status: "Active",
    diagnosedBy: {
      doctorId: "",
      doctorName: "",
      hospital: "",
    },
    treatments: [],
    followUps: [],
    documents: [],
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      loadMedicalHistory();
    }
  }, [user]);

  const loadMedicalHistory = async () => {
    try {
      const response = await medicalHistoryApi.getMedicalHistory();
      if (response.data.success) {
        setMedicalHistory(response.data.data.medicalHistory);
      }
    } catch (error) {
      console.error("Error loading medical history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.updateProfile({ name, email });
      setMessage("Profile updated successfully");
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user?._id) return;
    setDeletingEvent(eventId);
    try {
      await medicalHistoryApi.deleteMedicalHistoryEvent(eventId, user._id);
      setMedicalHistory((prev) => prev.filter((e) => e.eventId !== eventId));
      setMessage("Medical event deleted successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to delete event");
    } finally {
      setDeletingEvent(null);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await medicalHistoryApi.addMedicalHistoryEvent({
  patientId: user!._id,
  condition: {
    name: formData.conditionName,
    type: formData.conditionType,
    severity: formData.severity,
    description: formData.description,
  },

  diagnosedOn: formData.diagnosedOn,

  diagnosedBy: {
    doctorId: formData.diagnosedBy.doctorId || crypto.randomUUID(),
    doctorName: formData.diagnosedBy.doctorName,
    hospital: formData.diagnosedBy.hospital,
  },

  affectedBodyPart: formData.affectedBodyPart,

  treatments: formData.treatments.map(t => ({
    treatmentId: t.treatmentId || crypto.randomUUID(),
    type: t.type,
    details: {
      medicineName: t.medicineName ?? "",
      dosage: t.dosage ?? "",
      frequency: t.frequency ?? "",
      duration: t.duration ?? "",
      procedureName: t.procedureName ?? "",
      notes: t.notes ?? "",
    },
    startedOn: t.startedOn,
    endedOn: t.endedOn,
  })),

  followUps: formData.followUps.map(f => ({
    date: f.date,
    notes: f.notes,
    nextVisit: f.nextVisit,
  })),

  status: formData.status,

  documents: formData.documents.map(d => ({
    type: d.type,
    url: d.url,
  })),
});

      if (response.data.success) {
        setMedicalHistory((prev) => [...prev, response.data.data.event]);
        setMessage("Medical event added successfully");
        setIsAddingEvent(false);
        setFormData({
          conditionName: "",
          conditionType: "",
          severity: "Mild",
          description: "",
          diagnosedOn: "",
          affectedBodyPart: "",
          status: "Active",
          diagnosedBy: {
            doctorId: "",
            doctorName: "",
            hospital: "",
          },
          treatments: [],
          followUps: [],
          documents: [],
        });
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to add event");
    }
  };

  const handleUpdateEvent = async (eventId: string) => {
    try {
      const response = await medicalHistoryApi.updateMedicalHistoryEvent(
        eventId,
        {
          patientId: user!._id,
          condition: {
            name: formData.conditionName,
            type: formData.conditionType,
            severity: formData.severity,
            description: formData.description,
          },
          diagnosedOn: formData.diagnosedOn,
          affectedBodyPart: formData.affectedBodyPart,
          diagnosedBy: {
            doctorId: formData.diagnosedBy.doctorId || crypto.randomUUID(),
            doctorName: formData.diagnosedBy.doctorName,
            hospital: formData.diagnosedBy.hospital,
          },
          treatments: formData.treatments.map((t) => ({
            treatmentId: t.treatmentId || crypto.randomUUID(),
            type: t.type,
            details: {
              medicineName: t.medicineName ?? "",
              dosage: t.dosage ?? "",
              frequency: t.frequency ?? "",
              duration: t.duration ?? "",
              procedureName: t.procedureName ?? "",
              notes: t.notes ?? "",
            },
            startedOn: t.startedOn,
            endedOn: t.endedOn,
          })),
          followUps: formData.followUps.map((f) => ({
            date: f.date,
            notes: f.notes,
            nextVisit: f.nextVisit,
          })),
          status: formData.status,
          documents: formData.documents.map((d) => ({ type: d.type, url: d.url })),
        }
      );
      if (response.data.success) {
        setMedicalHistory((prev) =>
          prev.map((e) =>
            e.eventId === eventId ? response.data.data.event : e
          )
        );
        setMessage("Medical event updated successfully");
        setEditingEvent(null);
        setFormData({
          conditionName: "",
          conditionType: "",
          severity: "Mild",
          description: "",
          diagnosedOn: "",
          affectedBodyPart: "",
          status: "Active",
          diagnosedBy: {
            doctorId: "",
            doctorName: "",
            hospital: "",
          },
          treatments: [],
          followUps: [],
          documents: [],
        });
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to update event");
    }
  };

  const startEditing = (event: MedicalHistoryEvent) => {
    setEditingEvent(event.eventId);
    setFormData({
      conditionName: event.condition.name,
      conditionType: event.condition.type,
      severity: event.condition.severity,
      description: event.condition.description || "",
      diagnosedOn: event.diagnosedOn.split("T")[0],
      affectedBodyPart: event.affectedBodyPart || "",
      status: event.status,
      diagnosedBy: {
        doctorId: event.diagnosedBy.doctorId,
        doctorName: event.diagnosedBy.doctorName,
        hospital: event.diagnosedBy.hospital || "",
      },
      treatments: event.treatments.map((t) => ({
        treatmentId: t.treatmentId,
        type: t.type,
        medicineName: t.details.medicineName,
        dosage: t.details.dosage,
        frequency: t.details.frequency,
        duration: t.details.duration,
        procedureName: t.details.procedureName,
        notes: t.details.notes,
        startedOn: t.startedOn.split("T")[0],
        endedOn: t.endedOn ? t.endedOn.split("T")[0] : "",
      })),
      followUps: event.followUps.map((f) => ({
        date: f.date.split("T")[0],
        notes: f.notes,
        nextVisit: f.nextVisit ? f.nextVisit.split("T")[0] : "",
      })),
      documents: event.documents.map((d) => ({
        type: d.type,
        url: d.url,
      })),
    });
  };

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "recovering":
        return "bg-blue-100 text-blue-700";
      case "recovered":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-blue-800";
      case "moderate":
        return "text-blue-600";
      case "mild":
        return "text-blue-400";
      default:
        return "text-blue-500";
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {message && (
            <div
              className={`p-4 rounded-xl ${
                message.includes("success")
                  ? "bg-blue-50 text-blue-800"
                  : "bg-blue-100 text-blue-900"
              }`}
            >
              {message}
            </div>
          )}

          {user?.role === "patient" && (
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-lg">
              <div className="px-6 py-5 border-b border-blue-200 bg-white/50 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    Medical History
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 ml-13">
                    {medicalHistory.length} medical record
                    {medicalHistory.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingEvent(true)}
                  className="px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg flex items-center gap-2 font-medium"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Record
                </button>
              </div>

              <div className="p-6">
                {(isAddingEvent || editingEvent) && (
                  <div className="mb-6 p-6 bg-white rounded-2xl border-2 border-blue-300 text-black shadow-xl">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      {editingEvent
                        ? "Edit Medical Record"
                        : "Add New Medical Record"}
                    </h3>
                    <form
                      onSubmit={
                        editingEvent
                          ? (e) => {
                              e.preventDefault();
                              handleUpdateEvent(editingEvent);
                            }
                          : handleAddEvent
                      }
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Condition Name *
                        </label>
                        <input
                          type="text"
                          value={formData.conditionName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conditionName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Condition Type *
                        </label>
                        <select
                          value={formData.conditionType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              conditionType: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="Injury">Injury</option>
                          <option value="Disease">Illness</option>
                          <option value="Chronic">Chronic</option>
                          <option value="Allergy">Allergy</option>
                          <option value="Surgery">Surgery</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Severity *
                        </label>
                        <select
                          value={formData.severity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              severity: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="Mild">Mild</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Diagnosed On *
                        </label>
                        {/* <input
                          type="date"
                          value={formData.diagnosedOn}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              diagnosedOn: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        /> */}
                        <input
                          type="date"
                          value={formData.diagnosedOn}
                          max={new Date().toISOString().split("T")[0]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              diagnosedOn: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Affected Body Part
                        </label>
                        <input
                          type="text"
                          value={formData.affectedBodyPart}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              affectedBodyPart: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="e.g., Right Hand, Left Leg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Status *
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="Active">Active</option>
                          <option value="Recovering">Recovering</option>
                          <option value="Recovered">Recovered</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          rows={3}
                          placeholder="Additional details about the condition..."
                        />
                      </div>

                      <div className="md:col-span-2 pt-4 border-t border-slate-200">
                        <h4 className="text-md font-semibold text-slate-800 mb-3">
                          Diagnosed By
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Doctor Name *
                            </label>
                            <input
                              type="text"
                              value={formData.diagnosedBy.doctorName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  diagnosedBy: {
                                    ...formData.diagnosedBy,
                                    doctorName: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Hospital/Clinic
                            </label>
                            <input
                              type="text"
                              value={formData.diagnosedBy.hospital}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  diagnosedBy: {
                                    ...formData.diagnosedBy,
                                    hospital: e.target.value,
                                  },
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-semibold text-slate-800">
                            Treatments
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              const hasEmpty = formData.treatments.some((t) =>
                                (t.type || "") === "" &&
                                (t.medicineName || "") === "" &&
                                (t.dosage || "") === "" &&
                                (t.frequency || "") === "" &&
                                (t.duration || "") === "" &&
                                (t.procedureName || "") === "" &&
                                (t.notes || "") === "" &&
                                (t.startedOn || "") === "" &&
                                (t.endedOn || "") === ""
                              );
                              if (hasEmpty) return;
                              setFormData({
                                ...formData,
                                treatments: [
                                  ...formData.treatments,
                                  {
                                    type: "",
                                    medicineName: "",
                                    dosage: "",
                                    frequency: "",
                                    duration: "",
                                    procedureName: "",
                                    notes: "",
                                    startedOn: "",
                                    endedOn: "",
                                  },
                                ],
                              });
                            }}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            + Add Treatment
                          </button>
                        </div>
                        <div className="space-y-4">
                          {formData.treatments.map((treatment, index) => (
                            <div
                              key={index}
                              className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-blue-800">
                                  Treatment {index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      treatments: formData.treatments.filter(
                                        (_, i) => i !== index
                                      ),
                                    })
                                  }
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Type *
                                  </label>
                                  <select
                                    value={treatment.type}
                                    onChange={(e) => {
                                      const newTreatments = [
                                        ...formData.treatments,
                                      ];
                                      newTreatments[index].type =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        treatments: newTreatments,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  >
                                    <option value="">Select Type</option>
                                    <option value="Medication">
                                      Medication
                                    </option>
                                    <option value="Surgery">Surgery</option>
                                    <option value="Therapy">Therapy</option>
                                    <option value="Procedure">Procedure</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Medicine Name
                                  </label>
                                  <input
                                    type="text"
                                    value={treatment.medicineName || ""}
                                    onChange={(e) => {
                                      const newTreatments = [
                                        ...formData.treatments,
                                      ];
                                      newTreatments[index].medicineName =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        treatments: newTreatments,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Dosage
                                  </label>
                                  <input
                                    type="text"
                                    value={treatment.dosage || ""}
                                    onChange={(e) => {
                                      const newTreatments = [
                                        ...formData.treatments,
                                      ];
                                      newTreatments[index].dosage =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        treatments: newTreatments,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 500mg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Frequency
                                  </label>
                                  <input
                                    type="text"
                                    value={treatment.frequency || ""}
                                    onChange={(e) => {
                                      const newTreatments = [
                                        ...formData.treatments,
                                      ];
                                      newTreatments[index].frequency =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        treatments: newTreatments,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Twice daily"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Duration
                                  </label>
                                  <input
                                    type="text"
                                    value={treatment.duration || ""}
                                    onChange={(e) => {
                                      const newTreatments = [
                                        ...formData.treatments,
                                      ];
                                      newTreatments[index].duration =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        treatments: newTreatments,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 7 days"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Procedure Name
                                  </label>
                                  <input
                                    type="text"
                                    value={treatment.procedureName || ""}
                                    onChange={(e) => {
                                      const newTreatments = [
                                        ...formData.treatments,
                                      ];
                                      newTreatments[index].procedureName =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        treatments: newTreatments,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Started On *
                                  </label>
                                  <input
                                    type="date"
                                    value={treatment.startedOn}
                                    onChange={(e) => {
                                      const newTreatments = [
                                        ...formData.treatments,
                                      ];
                                      newTreatments[index].startedOn =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        treatments: newTreatments,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Ended On
                                  </label>
                                  <input
                                    type="date"
                                    value={treatment.endedOn || ""}
                                    onChange={(e) => {
                                      const newTreatments = [
                                        ...formData.treatments,
                                      ];
                                      newTreatments[index].endedOn =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        treatments: newTreatments,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Notes
                                  </label>
                                  <textarea
                                    value={treatment.notes || ""}
                                    onChange={(e) => {
                                      const newTreatments = [
                                        ...formData.treatments,
                                      ];
                                      newTreatments[index].notes =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        treatments: newTreatments,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-semibold text-slate-800">
                            Follow-up Visits
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              const hasEmpty = formData.followUps.some(
                                (f) =>
                                  (f.date || "") === "" &&
                                  (f.notes || "") === "" &&
                                  (f.nextVisit || "") === ""
                              );
                              if (hasEmpty) return;
                              setFormData({
                                ...formData,
                                followUps: [
                                  ...formData.followUps,
                                  {
                                    date: "",
                                    notes: "",
                                    nextVisit: "",
                                  },
                                ],
                              });
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            + Add Follow-up
                          </button>
                        </div>
                        <div className="space-y-4">
                          {formData.followUps.map((followUp, index) => (
                            <div
                              key={index}
                              className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-green-800">
                                  Follow-up {index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      followUps: formData.followUps.filter(
                                        (_, i) => i !== index
                                      ),
                                    })
                                  }
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Visit Date *
                                  </label>
                                  <input
                                    type="date"
                                    value={followUp.date}
                                    onChange={(e) => {
                                      const newFollowUps = [
                                        ...formData.followUps,
                                      ];
                                      newFollowUps[index].date = e.target.value;
                                      setFormData({
                                        ...formData,
                                        followUps: newFollowUps,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Next Visit
                                  </label>
                                  <input
                                    type="date"
                                    value={followUp.nextVisit || ""}
                                    onChange={(e) => {
                                      const newFollowUps = [
                                        ...formData.followUps,
                                      ];
                                      newFollowUps[index].nextVisit =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        followUps: newFollowUps,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Notes *
                                  </label>
                                  <textarea
                                    value={followUp.notes}
                                    onChange={(e) => {
                                      const newFollowUps = [
                                        ...formData.followUps,
                                      ];
                                      newFollowUps[index].notes =
                                        e.target.value;
                                      setFormData({
                                        ...formData,
                                        followUps: newFollowUps,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-md font-semibold text-slate-800">
                            Medical Documents
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              const hasEmpty = formData.documents.some(
                                (d) => (d.type || "") === "" && (d.url || "") === ""
                              );
                              if (hasEmpty) return;
                              setFormData({
                                ...formData,
                                documents: [
                                  ...formData.documents,
                                  {
                                    type: "",
                                    url: "",
                                  },
                                ],
                              });
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            + Add Document
                          </button>
                        </div>
                        <div className="space-y-4">
                          {formData.documents.map((document, index) => (
                            <div
                              key={index}
                              className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-purple-800">
                                  Document {index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      documents: formData.documents.filter(
                                        (_, i) => i !== index
                                      ),
                                    })
                                  }
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Document Type *
                                  </label>
                                  <input
                                    type="text"
                                    value={document.type}
                                    onChange={(e) => {
                                      const newDocuments = [
                                        ...formData.documents,
                                      ];
                                      newDocuments[index].type = e.target.value;
                                      setFormData({
                                        ...formData,
                                        documents: newDocuments,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., X-Ray, Lab Report"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1">
                                    Document URL (add the link to the document) *
                                  </label>
                                  <input
                                    type="url"
                                    value={document.url}
                                    onChange={(e) => {
                                      const newDocuments = [
                                        ...formData.documents,
                                      ];
                                      newDocuments[index].url = e.target.value;
                                      setFormData({
                                        ...formData,
                                        documents: newDocuments,
                                      });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://..."
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-2 flex gap-3 pt-2">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
                        >
                          {editingEvent ? "Update Record" : "Add Record"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingEvent(false);
                            setEditingEvent(null);
                            setFormData({
                              conditionName: "",
                              conditionType: "",
                              severity: "Mild",
                              description: "",
                              diagnosedOn: "",
                              affectedBodyPart: "",
                              status: "Active",
                              diagnosedBy: {
                                doctorId: "",
                                doctorName: "",
                                hospital: "",
                              },
                              treatments: [],
                              followUps: [],
                              documents: [],
                            });
                          }}
                          className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
                      <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                    </div>
                  </div>
                ) : medicalHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <svg
                        className="w-12 h-12 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      No Medical Records
                    </h3>
                    <p className="text-slate-500">
                      Your medical history will appear here once your doctor
                      adds records
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {medicalHistory.map((event) => {
                      const isExpanded = expandedEvents.has(event.eventId);
                      const isDeleting = deletingEvent === event.eventId;
                      console.log(event);
                      return (
                        <div
                          key={event.eventId}
                          className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                        >
                          <div className="p-5 bg-linear-to-r from-slate-50 to-white">
                            <div className="flex items-start justify-between gap-4">
                              <div
                                className="flex-1 cursor-pointer"
                                onClick={() =>
                                  toggleEventExpansion(event.eventId)
                                }
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <span
                                    className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(
                                      event.status
                                    )}`}
                                  >
                                    {event.status}
                                  </span>
                                  <h3 className="text-lg font-bold text-slate-800">
                                    {event.condition.name}
                                  </h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                      />
                                    </svg>
                                    {event.condition.type}
                                  </span>
                                  <span
                                    className={`flex items-center gap-1.5 font-semibold px-3 py-1 rounded-full ${getSeverityColor(
                                      event.condition.severity
                                    )} ${
                                      event.condition.severity.toLowerCase() ===
                                      "critical"
                                        ? "bg-red-100"
                                        : event.condition.severity.toLowerCase() ===
                                          "moderate"
                                        ? "bg-orange-100"
                                        : "bg-yellow-100"
                                    }`}
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                    {event.condition.severity}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-slate-600 bg-blue-50 px-3 py-1 rounded-full">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    {new Date(
                                      event.diagnosedOn
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                  {event.affectedBodyPart && (
                                    <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium">
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                      </svg>
                                      {event.affectedBodyPart}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    toggleEventExpansion(event.eventId)
                                  }
                                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <svg
                                    className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => startEditing(event)}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                                >
                                  <svg
                                    className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteEvent(event.eventId)
                                  }
                                  disabled={isDeleting}
                                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors group disabled:opacity-50"
                                >
                                  {isDeleting ? (
                                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <svg
                                      className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-6 space-y-6 bg-linear-to-br from-slate-50/50 to-white border-t-2 border-slate-100">
                              {event.condition.description && (
                                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg
                                      className="w-5 h-5 text-blue-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <h4 className="font-semibold text-slate-800">
                                      Description
                                    </h4>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed">
                                    {event.condition.description}
                                  </p>
                                </div>
                              )}

                              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <svg
                                    className="w-5 h-5 text-indigo-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <h4 className="font-semibold text-slate-800">
                                    Diagnosed By
                                  </h4>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {event.diagnosedBy.doctorName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {event.diagnosedBy.doctorName}
                                    </p>
                                    {event.diagnosedBy.hospital && (
                                      <p className="text-sm text-slate-500 flex items-center gap-1">
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                          />
                                        </svg>
                                        {event.diagnosedBy.hospital}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {event.treatments.length > 0 && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <svg
                                      className="w-5 h-5 text-blue-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                      />
                                    </svg>
                                    <h4 className="font-semibold text-slate-800">
                                      Treatments
                                    </h4>
                                  </div>
                                  <div className="grid gap-3">
                                    {event.treatments.map((treatment) => (
                                      <div
                                        key={treatment.treatmentId}
                                        className="p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm"
                                      >
                                        <div className="flex items-center justify-between mb-3">
                                          <span className="font-semibold text-slate-800 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                            {treatment.type}
                                          </span>
                                          <span className="text-xs font-medium text-slate-600 bg-white px-3 py-1 rounded-full shadow-sm">
                                            {new Date(
                                              treatment.startedOn
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                            })}
                                            {treatment.endedOn &&
                                              ` → ${new Date(
                                                treatment.endedOn
                                              ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                              })}`}
                                          </span>
                                        </div>
                                        <div className="space-y-1.5">
                                          {Object.entries(
                                            treatment.details
                                          ).map(([key, value]) => (
                                            <div
                                              key={key}
                                              className="flex items-start gap-2 text-sm"
                                            >
                                              <span className="font-medium text-blue-700 capitalize min-w-25">
                                                {key
                                                  .replace(/([A-Z])/g, " $1")
                                                  .trim()}
                                                :
                                              </span>
                                              <span className="text-slate-700">
                                                {value}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {event.followUps.length > 0 && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <svg
                                      className="w-5 h-5 text-green-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                      />
                                    </svg>
                                    <h4 className="font-semibold text-slate-800">
                                      Follow-up Visits
                                    </h4>
                                  </div>
                                  <div className="grid gap-3">
                                    {event.followUps.map((followUp, index) => (
                                      <div
                                        key={index}
                                        className="p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                            <svg
                                              className="w-4 h-4 text-blue-600"
                                              fill="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            </svg>
                                            {new Date(
                                              followUp.date
                                            ).toLocaleDateString("en-US", {
                                              month: "long",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                          </span>
                                          {followUp.nextVisit && (
                                            <span className="text-xs font-bold text-blue-700 bg-white px-3 py-1 rounded-full shadow-sm">
                                              Next:{" "}
                                              {new Date(
                                                followUp.nextVisit
                                              ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                              })}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-slate-700 leading-relaxed">
                                          {followUp.notes}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {event.documents.length > 0 && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <svg
                                      className="w-5 h-5 text-purple-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <h4 className="font-semibold text-slate-800">
                                      Medical Documents
                                    </h4>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    {event.documents.map((doc, index) => (
                                      <a
                                        key={index}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-4 bg-linear-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border-2 border-blue-200 transition-all duration-300 flex items-center gap-3 group shadow-sm hover:shadow-md"
                                      >
                                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                                          <svg
                                            className="w-5 h-5 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                            />
                                          </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                                            {doc.type}
                                          </p>
                                          <p className="text-xs text-slate-500">
                                            View Document
                                          </p>
                                        </div>
                                        <svg
                                          className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                          />
                                        </svg>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
