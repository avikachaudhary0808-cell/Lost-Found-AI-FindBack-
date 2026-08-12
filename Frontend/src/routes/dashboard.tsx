import { useState, useEffect, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/findback/ui";
import { Badge } from "@/components/findback/ui";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { api } from "@/lib/api";
import { VoiceAssistant } from "@/components/findback/VoiceAssistant";
import { ChatAssistant } from "@/components/findback/ChatAssistant";

type Tab = "lost" | "found" | "matches" | "verifications";

interface LostItem {
  id: number;
  title: string;
  description: string;
  category: string;
  color: string;
  approximateLocation: string;
  reportedAt: string;
  status: string;
  imagePath: string | null;
}

interface FoundItem {
  id: number;
  title: string;
  description: string;
  category: string;
  color: string;
  approximateLocation: string;
  reportedAt: string;
  status: string;
  imagePath: string | null;
}

interface Match {
  matchId: number;
  foundItemId: number;
  title: string;
  category: string;
  color: string;
  approximateLocation: string;
  reportedAt: string;
  matchScore: number;
  matchStatus: string;
  imageSimilarityScore: number | null;
}

interface Verification {
  id: number;
  matchId: number;
  challengeQuestion: string;
  status: string;
  notes: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FindBack" },
      { name: "description", content: "Manage your reports, matches and verifications." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("lost");
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showLostForm, setShowLostForm] = useState(false);
  const [showFoundForm, setShowFoundForm] = useState(false);
  const [editingLost, setEditingLost] = useState<LostItem | null>(null);
  const [editingFound, setEditingFound] = useState<FoundItem | null>(null);

  const [lostForm, setLostForm] = useState({
    title: "",
    description: "",
    category: "",
    color: "",
    approximateLocation: "",
  });
  const [foundForm, setFoundForm] = useState({
    title: "",
    description: "",
    category: "",
    color: "",
    approximateLocation: "",
  });
  const [lostImage, setLostImage] = useState<File | null>(null);
  const [foundImage, setFoundImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [verificationForm, setVerificationForm] = useState({
    matchId: "",
    challengeQuestion: "",
    answer: "",
  });
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        if (tab === "lost") {
          setLostForm((prev) => ({ ...prev, approximateLocation: locationText }));
        } else {
          setFoundForm((prev) => ({ ...prev, approximateLocation: locationText }));
        }
      },
      () => {
        setError("Unable to retrieve your location. Please enter it manually.");
      },
    );
  };

  const fetchLostItems = async () => {
    try {
      const data = await api.get<LostItem[]>("/api/lost-items");
      setLostItems(data);
    } catch (err) {
      console.error("Failed to load lost items:", err);
    }
  };

  const fetchFoundItems = async () => {
    try {
      const data = await api.get<FoundItem[]>("/api/found-items");
      setFoundItems(data);
    } catch (err) {
      console.error("Failed to load found items:", err);
    }
  };

  const fetchMatches = async () => {
    try {
      const allLost = await api.get<LostItem[]>("/api/lost-items");
      const matchPromises = allLost.map((item) =>
        api.get<Match[]>(`/api/matches/lost/${item.id}`).catch(() => []),
      );
      const results = await Promise.all(matchPromises);
      setMatches(results.flat());
    } catch (err) {
      console.error("Failed to load matches:", err);
    }
  };

  const fetchVerifications = async () => {
    try {
      const data = await api.get<Verification[]>("/api/verifications");
      setVerifications(data);
    } catch {
      setVerifications([]);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([fetchLostItems(), fetchFoundItems()]);
        await fetchMatches();
        await fetchVerifications();
      } catch {
        // Individual fetch errors are handled above
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, isLoading, navigate]);

  const handleCreateLost = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const item = await api.post<LostItem>("/api/lost-items", lostForm);
      setLostItems((prev) => [...prev, item]);
      if (lostImage) {
        const fd = new FormData();
        fd.append("image", lostImage);
        const updated = await api.postForm<LostItem>(`/api/lost-items/${item.id}/image`, fd);
        setLostItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      }
      setLostForm({ title: "", description: "", category: "", color: "", approximateLocation: "" });
      setLostImage(null);
      setShowLostForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lost item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLost = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingLost) return;
    setSubmitting(true);
    try {
      const updated = await api.put<LostItem>(`/api/lost-items/${editingLost.id}`, lostForm);
      setLostItems((prev) => prev.map((i) => (i.id === editingLost.id ? updated : i)));
      if (lostImage) {
        const fd = new FormData();
        fd.append("image", lostImage);
        const withImage = await api.postForm<LostItem>(`/api/lost-items/${editingLost.id}/image`, fd);
        setLostItems((prev) => prev.map((i) => (i.id === editingLost.id ? withImage : i)));
      }
      setEditingLost(null);
      setLostForm({ title: "", description: "", category: "", color: "", approximateLocation: "" });
      setLostImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lost item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLost = async (id: number) => {
    try {
      await api.del(`/api/lost-items/${id}`);
      setLostItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lost item");
    }
  };

  const handleCreateFound = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const item = await api.post<FoundItem>("/api/found-items", foundForm);
      setFoundItems((prev) => [...prev, item]);
      if (foundImage) {
        const fd = new FormData();
        fd.append("image", foundImage);
        const updated = await api.postForm<FoundItem>(`/api/found-items/${item.id}/image`, fd);
        setFoundItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      }
      setFoundForm({ title: "", description: "", category: "", color: "", approximateLocation: "" });
      setFoundImage(null);
      setShowFoundForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create found item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFound = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingFound) return;
    setSubmitting(true);
    try {
      const updated = await api.put<FoundItem>(`/api/found-items/${editingFound.id}`, foundForm);
      setFoundItems((prev) => prev.map((i) => (i.id === editingFound.id ? updated : i)));
      if (foundImage) {
        const fd = new FormData();
        fd.append("image", foundImage);
        const withImage = await api.postForm<FoundItem>(`/api/found-items/${editingFound.id}/image`, fd);
        setFoundItems((prev) => prev.map((i) => (i.id === editingFound.id ? withImage : i)));
      }
      setEditingFound(null);
      setFoundForm({ title: "", description: "", category: "", color: "", approximateLocation: "" });
      setFoundImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update found item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFound = async (id: number) => {
    try {
      await api.del(`/api/found-items/${id}`);
      setFoundItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete found item");
    }
  };

  const handleDeleteLostImage = async (id: number) => {
    try {
      await api.del(`/api/lost-items/${id}/image`);
      setLostItems((prev) => prev.map((i) => (i.id === id ? { ...i, imagePath: null } : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    }
  };

  const handleDeleteFoundImage = async (id: number) => {
    try {
      await api.del(`/api/found-items/${id}/image`);
      setFoundItems((prev) => prev.map((i) => (i.id === id ? { ...i, imagePath: null } : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    }
  };

  const handleCreateVerification = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const matchId = Number(verificationForm.matchId);
      const v = await api.post<Verification>("/api/verifications/match/" + matchId, {
        challengeQuestion: verificationForm.challengeQuestion,
        answer: verificationForm.answer,
      });
      setVerifications((prev) => [...prev, v]);
      setVerificationForm({ matchId: "", challengeQuestion: "", answer: "" });
      setShowVerificationForm(false);
      await fetchVerifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create verification");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnswer = async (verificationId: number, answer: string) => {
    try {
      const v = await api.post<Verification>(`/api/verifications/${verificationId}/answer`, { answer });
      setVerifications((prev) => prev.map((item) => (item.id === verificationId ? v : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer");
    }
  };

  const startEditLost = (item: LostItem) => {
    setEditingLost(item);
    setLostForm({
      title: item.title,
      description: item.description,
      category: item.category,
      color: item.color,
      approximateLocation: item.approximateLocation,
    });
    setLostImage(null);
  };

  const startEditFound = (item: FoundItem) => {
    setEditingFound(item);
    setFoundForm({
      title: item.title,
      description: item.description,
      category: item.category,
      color: item.color,
      approximateLocation: item.approximateLocation,
    });
    setFoundImage(null);
  };

  const imageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const parts = path.split("/");
    const folder = parts[parts.length - 2];
    const filename = parts[parts.length - 1];
    return `/api/images/${folder}/${filename}`;
  };

  if (isLoading || loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/" className="text-lg font-extrabold tracking-tight">
                FindBack
              </Link>
              <p className="text-xs text-muted-foreground">
                {t.welcomeBack}, {user?.fullName || user?.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  {t.home}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                {t.signOut}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-3 text-red-300 hover:text-red-100"
            >
              {t.dismiss}
            </button>
          </div>
        )}

        <div className="mb-8 flex gap-2 border-b border-border">
          {[
            { key: "lost", label: t.lostItems },
            { key: "found", label: t.foundItems },
            { key: "matches", label: t.matches },
            { key: "verifications", label: t.verifications },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key as Tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === item.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "lost" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">{t.lostItems}</h2>
              <Button
                size="sm"
                onClick={() => {
                  setShowLostForm(true);
                  setEditingLost(null);
                  setLostForm({
                    title: "",
                    description: "",
                    category: "",
                    color: "",
                    approximateLocation: "",
                  });
                  setLostImage(null);
                }}
              >
                + {t.reportLostItem}
              </Button>
            </div>

            {showLostForm && (
              <form
                onSubmit={editingLost ? handleUpdateLost : handleCreateLost}
                className="mb-8 rounded-xl border border-border bg-surface p-6"
              >
                <h3 className="mb-4 text-lg font-bold">{editingLost ? "Edit" : "New"} Lost Item</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.title}
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                      value={lostForm.title}
                      onChange={(e) => setLostForm({ ...lostForm, title: e.target.value })}
                      required
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.category}
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                      value={lostForm.category}
                      onChange={(e) => setLostForm({ ...lostForm, category: e.target.value })}
                      required
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.color}
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                      value={lostForm.color}
                      onChange={(e) => setLostForm({ ...lostForm, color: e.target.value })}
                      required
                      maxLength={30}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.location}
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                        value={lostForm.approximateLocation}
                        onChange={(e) =>
                          setLostForm({ ...lostForm, approximateLocation: e.target.value })
                        }
                        required
                        maxLength={255}
                        placeholder="Enter location or use GPS"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={getCurrentLocation}
                      >
                        {t.gps}
                      </Button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.description}
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                      rows={3}
                      value={lostForm.description}
                      onChange={(e) => setLostForm({ ...lostForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.image}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLostImage(e.target.files?.[0] || null)}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? t.loading : editingLost ? "Update" : t.createAccount}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowLostForm(false);
                      setEditingLost(null);
                    }}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </form>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lostItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-surface p-4">
                  {imageUrl(item.imagePath) && (
                    <img
                      src={imageUrl(item.imagePath)!}
                      alt={item.title}
                      className="mb-3 h-40 w-full rounded-lg object-cover"
                    />
                  )}
                  <h3 className="text-base font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge tone="teal">{item.category}</Badge>
                    <Badge tone="lime">{item.status}</Badge>
                  </div>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    {item.approximateLocation}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEditLost(item)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteLost(item.id)}>
                      Delete
                    </Button>
                    {item.imagePath && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLostImage(item.id)}
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {lostItems.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground">
                  {t.noItems}
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "found" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">{t.foundItems}</h2>
              <Button
                size="sm"
                onClick={() => {
                  setShowFoundForm(true);
                  setEditingFound(null);
                  setFoundForm({
                    title: "",
                    description: "",
                    category: "",
                    color: "",
                    approximateLocation: "",
                  });
                  setFoundImage(null);
                }}
              >
                + {t.reportFoundItem}
              </Button>
            </div>

            {showFoundForm && (
              <form
                onSubmit={editingFound ? handleUpdateFound : handleCreateFound}
                className="mb-8 rounded-xl border border-border bg-surface p-6"
              >
                <h3 className="mb-4 text-lg font-bold">{editingFound ? "Edit" : "New"} Found Item</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.title}
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                      value={foundForm.title}
                      onChange={(e) => setFoundForm({ ...foundForm, title: e.target.value })}
                      required
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.category}
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                      value={foundForm.category}
                      onChange={(e) => setFoundForm({ ...foundForm, category: e.target.value })}
                      required
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.color}
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                      value={foundForm.color}
                      onChange={(e) => setFoundForm({ ...foundForm, color: e.target.value })}
                      required
                      maxLength={30}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.location}
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                        value={foundForm.approximateLocation}
                        onChange={(e) =>
                          setFoundForm({ ...foundForm, approximateLocation: e.target.value })
                        }
                        required
                        maxLength={255}
                        placeholder="Enter location or use GPS"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={getCurrentLocation}
                      >
                        {t.gps}
                      </Button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.description}
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                      rows={3}
                      value={foundForm.description}
                      onChange={(e) => setFoundForm({ ...foundForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.image}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFoundImage(e.target.files?.[0] || null)}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? t.loading : editingFound ? "Update" : t.createAccount}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowFoundForm(false);
                      setEditingFound(null);
                    }}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </form>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {foundItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-surface p-4">
                  {imageUrl(item.imagePath) && (
                    <img
                      src={imageUrl(item.imagePath)!}
                      alt={item.title}
                      className="mb-3 h-40 w-full rounded-lg object-cover"
                    />
                  )}
                  <h3 className="text-base font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge tone="teal">{item.category}</Badge>
                    <Badge tone="lime">{item.status}</Badge>
                  </div>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    {item.approximateLocation}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEditFound(item)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteFound(item.id)}>
                      Delete
                    </Button>
                    {item.imagePath && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFoundImage(item.id)}
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {foundItems.length === 0 && (
                <p className="col-span-full text-sm text-muted-foreground">
                  {t.noItems}
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "matches" && (
          <div>
            <h2 className="mb-6 text-xl font-extrabold tracking-tight">{t.matches}</h2>
            {matches.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noMatches}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((m) => (
                  <div key={m.matchId} className="rounded-xl border border-border bg-surface p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-base font-bold tracking-tight">{m.title}</h3>
                      <span className="text-lg font-extrabold text-primary">
                        {Math.round((m.matchScore || 0) * 100)}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((m.matchScore || 0) * 100)}%`,
                          background: "var(--gradient-emerald)",
                        }}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge tone="teal">{m.category}</Badge>
                      <Badge tone="amber">{m.matchStatus}</Badge>
                    </div>
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                      {m.approximateLocation}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                      Image similarity:{" "}
                      {m.imageSimilarityScore !== null
                        ? `${Math.round(m.imageSimilarityScore * 100)}%`
                        : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "verifications" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight">{t.verifications}</h2>
              <Button size="sm" onClick={() => setShowVerificationForm((v) => !v)}>
                {showVerificationForm ? t.cancel : `+ ${t.createVerification}`}
              </Button>
            </div>

            {showVerificationForm && (
              <form
                onSubmit={handleCreateVerification}
                className="mb-8 rounded-xl border border-border bg-surface p-6"
              >
                <h3 className="mb-4 text-lg font-bold">{t.createVerification}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.matchId}
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                      value={verificationForm.matchId}
                      onChange={(e) =>
                        setVerificationForm({ ...verificationForm, matchId: e.target.value })
                      }
                      required
                      type="number"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.challengeQuestion}
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                      value={verificationForm.challengeQuestion}
                      onChange={(e) =>
                        setVerificationForm({
                          ...verificationForm,
                          challengeQuestion: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t.answer}
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                      value={verificationForm.answer}
                      onChange={(e) =>
                        setVerificationForm({ ...verificationForm, answer: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? t.loading : t.createVerification}
                  </Button>
                </div>
              </form>
            )}

            {verifications.length === 0 && !showVerificationForm ? (
              <p className="text-sm text-muted-foreground">{t.noVerifications}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {verifications.map((v) => (
                  <div key={v.id} className="rounded-xl border border-border bg-surface p-4">
                    <h3 className="text-base font-bold tracking-tight">Verification #{v.id}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Match ID: {v.matchId}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge
                        tone={
                          v.status === "PASSED" ? "lime" : v.status === "FAILED" ? "amber" : "teal"
                        }
                      >
                        {v.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {v.challengeQuestion}
                    </p>
                    {v.status === "PENDING" && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder={t.yourAnswer}
                          className="mb-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value.trim()) {
                              handleSubmitAnswer(v.id, e.currentTarget.value.trim());
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const input = document.querySelector(
                              `input[placeholder="${t.yourAnswer}"]`,
                            ) as HTMLInputElement | null;
                            if (input && input.value.trim()) {
                              handleSubmitAnswer(v.id, input.value.trim());
                              input.value = "";
                            }
                          }}
                        >
                          {t.submitAnswer}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <VoiceAssistant />
      <ChatAssistant />
    </div>
  );
}
