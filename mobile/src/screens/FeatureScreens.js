import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
  ImageBackground,
} from "react-native";

import api from "../api/api";
import { COLORS as C } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { getEventImage } from "../components/eventImages";

const S = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: C.background,
    padding: 16,
  },
  title: {
    fontSize: 25,
    fontWeight: "900",
    color: C.text,
    marginBottom: 15,
  },
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },
  heading: {
    fontSize: 17,
    fontWeight: "800",
    color: C.text,
  },
  text: {
    color: C.secondaryText,
    lineHeight: 21,
    marginTop: 5,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 12,
    color: C.text,
    marginTop: 9,
  },
  button: {
    backgroundColor: C.primary,
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  outline: {
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 10,
    padding: 11,
    alignItems: "center",
    marginTop: 9,
  },
  outlineText: {
    color: C.primary,
    fontWeight: "800",
  },
  error: {
    color: C.danger,
    marginVertical: 10,
  },
  muted: {
    color: C.secondaryText,
    marginTop: 8,
  },
});

function Input({ value, onChangeText, placeholder, multiline = false }) {
  return (
    <TextInput
      style={[
        S.input,
        multiline && {
          minHeight: 95,
          textAlignVertical: "top",
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={C.secondaryText}
      multiline={multiline}
    />
  );
}

function Button({ title, onPress, outline = false }) {
  return (
    <TouchableOpacity style={outline ? S.outline : S.button} onPress={onPress}>
      <Text style={outline ? S.outlineText : S.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

function Message({ error, loading }) {
  if (loading) {
    return <ActivityIndicator color={C.primary} style={{ margin: 20 }} />;
  }

  if (error) {
    return <Text style={S.error}>{error}</Text>;
  }

  return null;
}

function useApiList(path, params) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(path, { params });
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : data.events ||
          data.registrations ||
          data.users ||
          data.announcements ||
          data.logs ||
          data.data ||
          [];

      setItems(list);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Unable to load information.",
      );
    } finally {
      setLoading(false);
    }
  }, [path, JSON.stringify(params || {})]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, setItems, loading, error, load };
}

function RecordCard({ title, subtitle, children }) {
  return (
    <View style={S.card}>
      <Text style={S.heading}>{title || "Untitled"}</Text>

      {subtitle ? <Text style={S.text}>{subtitle}</Text> : null}

      {children}
    </View>
  );
}

// --------------------------------------------------
// STUDENT: EVENT DETAILS, REGISTRATION AND BOOKMARKS
// --------------------------------------------------

export function EventDetailsScreen({ route }) {
  const event = route.params?.event || {};
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");

  const eventId = event._id || event.id;

  const register = async () => {
    if (!eventId) {
      Alert.alert("Error", "Event ID is missing.");
      return;
    }

    try {
      setBusy(true);

      await api.post(`/registrations/${eventId}`, {
        notes,
        customAnswers: [],
      });

      Alert.alert("UNIVENTY", "Registration submitted successfully.");
    } catch (e) {
      Alert.alert(
        "Registration failed",
        e.response?.data?.message || e.message,
      );
    } finally {
      setBusy(false);
    }
  };

  const bookmark = async () => {
    try {
      await api.post(`/events/${eventId}/bookmark`);
      Alert.alert("UNIVENTY", "Bookmark request submitted.");
    } catch (e) {
      Alert.alert("Bookmark", e.response?.data?.message || e.message);
    }
  };

  const review = async () => {
    Alert.prompt?.("Review event", "Enter your review", async (comment) => {
      try {
        await api.post(`/events/${eventId}/reviews`, {
          comment,
          rating: 5,
        });
        Alert.alert("Review", "Review submitted.");
      } catch (e) {
        Alert.alert("Review", e.message);
      }
    }) ||
      Alert.alert(
        "Review",
        "Review submission is available through the website.",
      );
  };

  return (
    <ScrollView style={S.page}>
      <ImageBackground
        source={event.image || event.coverImage || event.poster ? { uri: event.image || event.coverImage || event.poster } : getEventImage(event.category)}
        style={{ height: 205, borderRadius: 16, overflow: "hidden", justifyContent: "flex-end", padding: 16, marginBottom: 18 }}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(25,30,18,0.42)" }} />
        <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "900" }}>
          {event.name || event.title || "Event details"}
        </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 11, marginTop: 5 }}>
          {event.category || "Campus event"}
        </Text>
      </ImageBackground>

      <RecordCard title="Event information" subtitle={event.description}>
        <Text style={S.text}>Category: {event.category || "General"}</Text>
        <Text style={S.text}>
          Date:{" "}
          {event.eventDate
            ? new Date(event.eventDate).toLocaleString()
            : "To be announced"}
        </Text>
        <Text style={S.text}>
          Venue: {event.eventLocation || "To be announced"}
        </Text>
      </RecordCard>

      <Text style={S.heading}>Registration notes</Text>

      <Input
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional notes"
        multiline
      />

      <Button
        title={busy ? "Submitting..." : "Register for event"}
        onPress={register}
      />

      <Button title="Bookmark event" outline onPress={bookmark} />

      <Button title="Write a review" outline onPress={review} />
    </ScrollView>
  );
}

// --------------------------------------------------
// STUDENT: MY REGISTRATIONS
// --------------------------------------------------

export function MyRegistrationsScreen() {
  const { items, loading, error, load } = useApiList(
    "/registrations/my-registrations",
  );

  const cancel = async (id) => {
    Alert.alert("Cancel registration", "Are you sure you want to cancel?", [
      { text: "Keep registration" },
      {
        text: "Cancel registration",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/registrations/${id}/cancel`);
            load();
          } catch (e) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const certificate = async (id) => {
    try {
      const response = await api.get(`/registrations/${id}/certificate`);

      Alert.alert(
        "Certificate",
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data, null, 2),
      );
    } catch (e) {
      Alert.alert("Certificate", e.message);
    }
  };

  return (
    <ScrollView
      style={S.page}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <Text style={S.title}>My registrations</Text>

      <Message loading={loading} error={error} />

      {items.map((r) => (
        <RecordCard
          key={r._id}
          title={r.event?.name || r.eventName || "Event registration"}
          subtitle={`Status: ${r.status || "Pending"}`}
        >
          <Button
            title="Cancel registration"
            outline
            onPress={() => cancel(r._id)}
          />

          <Button
            title="View certificate"
            outline
            onPress={() => certificate(r._id)}
          />
        </RecordCard>
      ))}

      {!loading && items.length === 0 && (
        <Text style={S.muted}>You have no registrations.</Text>
      )}
    </ScrollView>
  );
}

// --------------------------------------------------
// STUDENT: BOOKMARKS
// --------------------------------------------------

export function BookmarksScreen() {
  const { items, loading, error } = useApiList("/events/my-bookmarks");

  return (
    <ScrollView style={S.page}>
      <Text style={S.title}>Saved events</Text>

      <Message loading={loading} error={error} />

      {items.map((item) => (
        <RecordCard
          key={item._id}
          title={item.name || item.event?.name || "Bookmarked event"}
          subtitle={item.description || ""}
        />
      ))}

      {!loading && items.length === 0 && (
        <Text style={S.muted}>No bookmarked events found.</Text>
      )}
    </ScrollView>
  );
}

// --------------------------------------------------
// STUDENT: NOTIFICATIONS
// --------------------------------------------------

export function NotificationsScreen() {
  const { items, loading, error, load } = useApiList("/notifications");

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      load();
    } catch (e) {
      Alert.alert("Notification", e.message);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      load();
    } catch (e) {
      Alert.alert("Notification", e.message);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      load();
    } catch (e) {
      Alert.alert("Notification", e.message);
    }
  };

  return (
    <ScrollView style={S.page}>
      <Text style={S.title}>Notifications</Text>

      <Button title="Mark all as read" outline onPress={markAllRead} />

      <Message loading={loading} error={error} />

      {items.map((n) => (
        <RecordCard
          key={n._id}
          title={n.title || n.message || "Notification"}
          subtitle={n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
        >
          <Button
            title="Mark as read"
            outline
            onPress={() => markRead(n._id)}
          />

          <Button
            title="Delete notification"
            outline
            onPress={() => remove(n._id)}
          />
        </RecordCard>
      ))}
    </ScrollView>
  );
}

// --------------------------------------------------
// STUDENT: EDIT PROFILE
// --------------------------------------------------

export function EditProfileScreen() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [rollNumber, setRollNumber] = useState(user?.rollNumber || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    try {
      setBusy(true);

      await api.put("/profile", {
        name,
        phone,
        department,
        rollNumber,
        bio,
      });

      await refreshUser();

      Alert.alert("Profile", "Profile updated successfully.");
    } catch (e) {
      Alert.alert(
        "Profile update failed",
        e.response?.data?.message || e.message,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={S.page}>
      <Text style={S.title}>Edit profile</Text>

      <Input value={name} onChangeText={setName} placeholder="Full name" />
      <Input value={phone} onChangeText={setPhone} placeholder="Phone" />
      <Input
        value={department}
        onChangeText={setDepartment}
        placeholder="Department"
      />
      <Input
        value={rollNumber}
        onChangeText={setRollNumber}
        placeholder="Roll number"
      />
      <Input value={bio} onChangeText={setBio} placeholder="Bio" multiline />

      <Button title={busy ? "Saving..." : "Save profile"} onPress={save} />
    </ScrollView>
  );
}

// --------------------------------------------------
// ORGANISER: CREATE AND MANAGE EVENTS
// --------------------------------------------------

export function ManageEventsScreen() {
  const { items, loading, error, load } = useApiList(
    "/events/organiser/my-events",
  );

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setCategory("");
    setEventDate("");
    setEventLocation("");
  };

  const edit = (event) => {
    setEditingId(event._id);
    setName(event.name || "");
    setDescription(event.description || "");
    setCategory(event.category || "");
    setEventDate(event.eventDate ? String(event.eventDate).slice(0, 10) : "");
    setEventLocation(event.eventLocation || "");
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Event name is required.");
      return;
    }

    try {
      setBusy(true);

      const payload = {
        name,
        description,
        category,
        eventDate,
        eventLocation,
      };

      if (editingId) {
        await api.put(`/events/${editingId}`, payload);
      } else {
        await api.post("/events", payload);
      }

      Alert.alert("Events", editingId ? "Event updated." : "Event created.");

      reset();
      load();
    } catch (e) {
      Alert.alert("Event error", e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = (id) => {
    Alert.alert("Delete event", "Delete this event?", [
      { text: "Keep" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/events/${id}`);
            load();
          } catch (e) {
            Alert.alert("Delete failed", e.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={S.page}>
      <Text style={S.title}>Manage events</Text>

      <RecordCard title={editingId ? "Edit event" : "Create event"}>
        <Input value={name} onChangeText={setName} placeholder="Event name" />
        <Input
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline
        />
        <Input
          value={category}
          onChangeText={setCategory}
          placeholder="Category"
        />
        <Input
          value={eventDate}
          onChangeText={setEventDate}
          placeholder="Date (YYYY-MM-DD)"
        />
        <Input
          value={eventLocation}
          onChangeText={setEventLocation}
          placeholder="Venue"
        />

        <Button
          title={
            busy ? "Saving..." : editingId ? "Update event" : "Create event"
          }
          onPress={save}
        />

        {editingId ? (
          <Button title="Stop editing" outline onPress={reset} />
        ) : null}
      </RecordCard>

      <Message loading={loading} error={error} />

      {items.map((event) => (
        <RecordCard
          key={event._id}
          title={event.name}
          subtitle={`${event.category || ""} • ${event.eventDate || ""}`}
        >
          <Button title="Edit event" outline onPress={() => edit(event)} />

          <Button
            title="Manage participants"
            outline
            onPress={() =>
              Alert.alert(
                "Participants",
                `Event ID: ${event._id}. Use the participant management screen from the event dashboard.`,
              )
            }
          />

          <Button
            title="Delete event"
            outline
            onPress={() => remove(event._id)}
          />
        </RecordCard>
      ))}
    </ScrollView>
  );
}

// --------------------------------------------------
// ORGANISER: PARTICIPANTS AND REGISTRATION REVIEWS
// --------------------------------------------------

export function ParticipantsScreen({ route }) {
  const eventId = route.params?.eventId;

  const { items, loading, error, load } = useApiList(
    `/registrations/event/${eventId}`,
  );

  const review = async (registrationId, status) => {
    try {
      await api.patch(`/registrations/${registrationId}/review`, {
        status,
        notes: "Reviewed by organiser",
      });

      load();
    } catch (e) {
      Alert.alert("Review failed", e.message);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await api.get(
        `/registrations/event/${eventId}/export-csv`,
      );

      Alert.alert(
        "Export",
        "CSV export request completed. The response was received from the server.",
      );

      return response.data;
    } catch (e) {
      Alert.alert("Export failed", e.message);
    }
  };

  const issueCertificates = async () => {
    try {
      await api.post(`/registrations/event/${eventId}/issue-certificates`);

      Alert.alert("Certificates", "Certificate request submitted.");
    } catch (e) {
      Alert.alert("Certificates", e.message);
    }
  };

  return (
    <ScrollView style={S.page}>
      <Text style={S.title}>Event participants</Text>

      <Button title="Export CSV" outline onPress={exportCSV} />
      <Button title="Issue certificates" onPress={issueCertificates} />

      <Message loading={loading} error={error} />

      {items.map((r) => (
        <RecordCard
          key={r._id}
          title={r.user?.name || r.student?.name || "Participant"}
          subtitle={`Status: ${r.status || "Pending"}`}
        >
          <Text style={S.text}>{r.user?.email || r.student?.email || ""}</Text>

          <Button title="Approve" onPress={() => review(r._id, "Approved")} />

          <Button
            title="Reject"
            outline
            onPress={() => review(r._id, "Rejected")}
          />
        </RecordCard>
      ))}
    </ScrollView>
  );
}

// --------------------------------------------------
// ADMIN: USER MANAGEMENT
// --------------------------------------------------

export function AdminUsersScreen() {
  const { items, loading, error, load } = useApiList("/admin/users");

  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("Policy violation");

  const filtered = items.filter((u) => {
    const value = `${u.name || ""} ${u.email || ""}`.toLowerCase();
    return value.includes(search.toLowerCase());
  });

  const toggleBlock = async (user) => {
    try {
      if (user.accountStatus === "blocked") {
        await api.post(`/admin/users/${user._id}/unblock`);
      } else {
        await api.post(`/admin/users/${user._id}/block`, {
          reason,
        });
      }

      load();
    } catch (e) {
      Alert.alert("User management", e.message);
    }
  };

  const editUser = (user) => {
    Alert.alert(
      "User information",
      `${user.name}\n${user.email}\n${user.category}\n\nFor full editing, use the admin user editor on the website.`,
    );
  };

  return (
    <ScrollView style={S.page}>
      <Text style={S.title}>Manage users</Text>

      <Input
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name or email"
      />

      <Input
        value={reason}
        onChangeText={setReason}
        placeholder="Reason for blocking"
      />

      <Message loading={loading} error={error} />

      {filtered.map((user) => (
        <RecordCard
          key={user._id}
          title={user.name}
          subtitle={`${user.email} • ${user.category || ""} • ${user.accountStatus || "active"}`}
        >
          <Button title="View user" outline onPress={() => editUser(user)} />

          <Button
            title={
              user.accountStatus === "blocked"
                ? "Unblock account"
                : "Block account"
            }
            onPress={() => toggleBlock(user)}
          />
        </RecordCard>
      ))}
    </ScrollView>
  );
}

// --------------------------------------------------
// ADMIN: EVENT APPROVAL AND MANAGEMENT
// --------------------------------------------------

export function AdminEventsScreen() {
  const { items, loading, error, load } = useApiList("/admin/events");

  const review = async (id, status) => {
    try {
      await api.patch(`/admin/events/${id}/review`, { status });
      load();
    } catch (e) {
      Alert.alert("Event review", e.message);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/events/${id}`);
      load();
    } catch (e) {
      Alert.alert("Delete event", e.message);
    }
  };

  return (
    <ScrollView style={S.page}>
      <Text style={S.title}>Manage events</Text>

      <Message loading={loading} error={error} />

      {items.map((event) => (
        <RecordCard
          key={event._id}
          title={event.name}
          subtitle={`Category: ${event.category || ""} • Status: ${event.status || "Unknown"}`}
        >
          <Button
            title="Approve event"
            onPress={() => review(event._id, "Approved")}
          />

          <Button
            title="Reject event"
            outline
            onPress={() => review(event._id, "Rejected")}
          />

          <Button
            title="Delete event"
            outline
            onPress={() => remove(event._id)}
          />
        </RecordCard>
      ))}
    </ScrollView>
  );
}

// --------------------------------------------------
// ADMIN: REGISTRATION MANAGEMENT
// --------------------------------------------------

export function AdminRegistrationsScreen() {
  const { items, loading, error, load } = useApiList("/admin/registrations");

  const review = async (id, status) => {
    try {
      await api.patch(`/admin/registrations/${id}/review`, {
        status,
        notes: "Reviewed by administrator",
      });

      load();
    } catch (e) {
      Alert.alert("Registration review", e.message);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/registrations/${id}`);
      load();
    } catch (e) {
      Alert.alert("Registration", e.message);
    }
  };

  return (
    <ScrollView style={S.page}>
      <Text style={S.title}>Manage registrations</Text>

      <Message loading={loading} error={error} />

      {items.map((r) => (
        <RecordCard
          key={r._id}
          title={r.user?.name || r.event?.name || "Registration"}
          subtitle={`Status: ${r.status || "Pending"}`}
        >
          <Button title="Approve" onPress={() => review(r._id, "Approved")} />

          <Button
            title="Reject"
            outline
            onPress={() => review(r._id, "Rejected")}
          />

          <Button
            title="Delete registration"
            outline
            onPress={() => remove(r._id)}
          />
        </RecordCard>
      ))}
    </ScrollView>
  );
}

// --------------------------------------------------
// ADMIN: ANNOUNCEMENTS
// --------------------------------------------------

export function AnnouncementsScreen() {
  const { items, loading, error, load } = useApiList("/admin/announcements");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const create = async () => {
    try {
      if (!title.trim() || !message.trim()) {
        Alert.alert("Validation", "Enter a title and message.");
        return;
      }

      await api.post("/admin/announcements", {
        title,
        message,
      });

      setTitle("");
      setMessage("");

      load();

      Alert.alert("Announcements", "Announcement published.");
    } catch (e) {
      Alert.alert("Announcement", e.message);
    }
  };

  const toggle = async (id) => {
    try {
      await api.patch(`/admin/announcements/${id}/toggle`);
      load();
    } catch (e) {
      Alert.alert("Announcement", e.message);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/admin/announcements/${id}`);
      load();
    } catch (e) {
      Alert.alert("Announcement", e.message);
    }
  };

  return (
    <ScrollView style={S.page}>
      <Text style={S.title}>Announcements</Text>

      <RecordCard title="Create announcement">
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="Announcement title"
        />

        <Input
          value={message}
          onChangeText={setMessage}
          placeholder="Announcement message"
          multiline
        />

        <Button title="Publish announcement" onPress={create} />
      </RecordCard>

      <Message loading={loading} error={error} />

      {items.map((a) => (
        <RecordCard key={a._id} title={a.title} subtitle={a.message}>
          <Button
            title="Toggle active status"
            outline
            onPress={() => toggle(a._id)}
          />

          <Button
            title="Delete announcement"
            outline
            onPress={() => remove(a._id)}
          />
        </RecordCard>
      ))}
    </ScrollView>
  );
}

// --------------------------------------------------
// ADMIN: ANALYTICS
// --------------------------------------------------

export function AdminAnalyticsScreen() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/analytics")
      .then((response) => setAnalytics(response.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={S.page}>
      <Text style={S.title}>Admin analytics</Text>

      <Message loading={loading} error={error} />

      {analytics ? (
        <RecordCard title="Analytics data">
          <Text style={S.text}>{JSON.stringify(analytics, null, 2)}</Text>
        </RecordCard>
      ) : null}
    </ScrollView>
  );
}
