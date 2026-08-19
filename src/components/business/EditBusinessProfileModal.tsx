import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessProfile, useBusinessProfiles } from "./BusinessProfileProvider";

type ProfileForm = {
  name: string;
  industry: string;
  location: string;
  description: string;
  avatarUrl: string;
  bannerUrl: string;
  email: string;
  phone: string;
  website: string;
  facebook: string;
  linkedin: string;
  instagram: string;
};

const EMPTY_FORM: ProfileForm = {
  name: "",
  industry: "",
  location: "",
  description: "",
  avatarUrl: "",
  bannerUrl: "",
  email: "",
  phone: "",
  website: "",
  facebook: "",
  linkedin: "",
  instagram: "",
};

export function EditBusinessProfileModal({
  businessId,
  trigger,
}: {
  businessId: string;
  trigger: ReactElement;
}) {
  const business = useBusinessProfile(businessId);
  const { updateBusiness } = useBusinessProfiles();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);

  useEffect(() => {
    if (!open || !business) return;
    setForm({
      name: business.name,
      industry: business.industry,
      location: business.location,
      description: business.description,
      avatarUrl: business.avatarUrl ?? "",
      bannerUrl: business.bannerUrl ?? "",
      email: business.contact.email,
      phone: business.contact.phone,
      website: business.website,
      facebook: business.socialLinks?.facebook ?? "",
      linkedin: business.socialLinks?.linkedin ?? "",
      instagram: business.socialLinks?.instagram ?? "",
    });
  }, [business, open]);

  const setField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!business || saving) return;
    setSaving(true);
    try {
      await updateBusiness(business.id, {
        name: form.name.trim(),
        industry: form.industry.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        avatarUrl: form.avatarUrl.trim(),
        bannerUrl: form.bannerUrl.trim(),
        website: form.website.trim(),
        contact: {
          ...business.contact,
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
        socialLinks: {
          facebook: form.facebook.trim(),
          linkedin: form.linkedin.trim(),
          instagram: form.instagram.trim(),
        },
      });
      toast.success("Profile updated successfully!");
      setOpen(false);
    } catch (error) {
      toast.error("Unable to update profile", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!business) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit business profile</DialogTitle>
            <DialogDescription>
              Keep your public business details accurate for buyers and marketplace partners.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ProfileField label="Business name" value={form.name} onChange={(value) => setField("name", value)} required />
            <ProfileField label="Category / Industry" value={form.industry} onChange={(value) => setField("industry", value)} required />
            <ProfileField label="Location" value={form.location} onChange={(value) => setField("location", value)} required />
            <ProfileField label="Website" value={form.website} onChange={(value) => setField("website", value)} placeholder="greenstitch.com.mm" />

            <div className="sm:col-span-2">
              <Label htmlFor="business-description">About / Description</Label>
              <Textarea
                id="business-description"
                className="mt-1.5 min-h-28"
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                maxLength={1200}
                required
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{form.description.length}/1200</p>
            </div>

            <ProfileField label="Avatar / Logo URL" value={form.avatarUrl} onChange={(value) => setField("avatarUrl", value)} placeholder="https://…" />
            <ProfileField label="Banner / Cover image URL" value={form.bannerUrl} onChange={(value) => setField("bannerUrl", value)} placeholder="https://…" />

            <div className="sm:col-span-2 border-t border-border pt-4">
              <h3 className="font-display text-sm font-semibold">Contact details</h3>
            </div>
            <ProfileField label="Email" value={form.email} onChange={(value) => setField("email", value)} type="email" required />
            <ProfileField label="Phone" value={form.phone} onChange={(value) => setField("phone", value)} required />
            <ProfileField label="Facebook" value={form.facebook} onChange={(value) => setField("facebook", value)} placeholder="facebook.com/…" />
            <ProfileField label="LinkedIn" value={form.linkedin} onChange={(value) => setField("linkedin", value)} placeholder="linkedin.com/company/…" />
            <ProfileField label="Instagram" value={form.instagram} onChange={(value) => setField("instagram", value)} placeholder="instagram.com/…" />
          </div>

          <DialogFooter className="mt-6 gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={saving}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <LoaderCircle className="size-4 animate-spin" />}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  const id = `profile-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        className="mt-1.5"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
