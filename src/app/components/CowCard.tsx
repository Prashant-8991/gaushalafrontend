import { useEffect } from "react";
import { useNavigate } from "react-router";

interface CowCardProps { cow?: { tagNumber?: string; tag_number?: string }; onClose: () => void; onSelectCow?: (cow: any) => void; }
export function CowCard({ cow, onClose }: CowCardProps) {
  const navigate = useNavigate();
  const tag = cow?.tagNumber ?? (cow as any)?.tag_number ?? "";
  useEffect(() => { if (tag) navigate(`/cattle/${encodeURIComponent(tag)}`); else onClose(); }, [tag, navigate, onClose]);
  return null;
}
