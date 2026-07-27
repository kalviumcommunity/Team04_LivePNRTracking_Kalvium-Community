"use client";

import { useState, useTransition } from "react";
import { 
  Train, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Loader2, 
  HelpCircle,
  ArrowRightLeft,
  Search,
  ShieldCheck,
  User,
  CreditCard,
  QrCode,
  Download,
  Info,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClassItem {
  code: string;
  name: string;
  status: string;
  color: string;
  fare: number;
}

interface TrainType {
  name: string;
  no: string;
  from: string;
  to: string;
  dep: string;
  arr: string;
  duration: string;
  days: string[];
  classes: ClassItem[];
}

interface BookingResult {
  pnr: string;
  trainName: string;
  trainNo: string;
  dateOfJourney: string | Date;
  fromStation: string;
  toStation: string;
  status: string;
  seat: string;
}

interface TicketBookingProps {
  onBookSuccess: () => void;
  bookTicketAction: (data: {
    trainName: string;
    trainNo: string;
    fromCode: string;
    from: string;
    toCode: string;
    to: string;
    travelClass: string;
    passengerName: string;
  }) => Promise<{ success?: boolean; booking?: BookingResult; error?: string }>;
}

const STATIONS = [
  { name: "New Delhi", code: "NDLS" },
  { name: "Kanpur Central", code: "CNB" },
  { name: "Lucknow Jn", code: "LJN" },
  { name: "Amritsar Jn", code: "ASR" },
  { name: "Varanasi Jn", code: "BSB" },
  { name: "Chennai Central", code: "MAS" },
  { name: "Madurai Jn", code: "MDU" },
  { name: "Coimbatore Jn", code: "CBE" },
  { name: "Tiruchchirappalli Jn", code: "TPJ" },
  { name: "Mumbai Central", code: "MMCT" },
  { name: "Howrah Jn", code: "HWH" },
  { name: "KSR Bengaluru", code: "SBC" },
  { name: "Secunderabad Jn", code: "SC" },
  { name: "Pune Jn", code: "PUNE" },
  { name: "Trivandrum Central", code: "TVC" },
  { name: "Ernakulam Jn (Kochi)", code: "ERS" },
  { name: "Mangaluru Central", code: "MAQ" },
  { name: "Vijayawada Jn", code: "BZA" },
  { name: "Visakhapatnam Jn", code: "VSKP" },
  { name: "Mysuru Jn", code: "MYS" },
  { name: "Salem Jn", code: "SA" },
  { name: "Tirunelveli Jn", code: "TEN" },
  { name: "Kanyakumari", code: "CAPE" },
  { name: "Chandigarh", code: "CDG" },
  { name: "Panipat Jn", code: "PNP" },
  { name: "Ambala Cantt Jn", code: "UMB" },
];

const TRAINS = [
  { name: "Rajdhani Express", no: "12425", from: "NDLS", to: "CNB", dep: "16:55", arr: "21:45", duration: "04h 50m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0048", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2120 },
    { code: "2A", name: "AC 2 Tier", status: "AVAILABLE - 0012", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2890 },
    { code: "1A", name: "AC First Class", status: "RAC - 02", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20", fare: 4150 }
  ]},
  { name: "Shatabdi Express", no: "12004", from: "NDLS", to: "LJN", dep: "06:10", arr: "12:40", duration: "06h 30m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0124", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 515 },
    { code: "EC", name: "Exec Chair Car", status: "WL - 08", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20", fare: 1240 }
  ]},
  { name: "Garib Rath Express", no: "12204", from: "NDLS", to: "ASR", dep: "13:30", arr: "20:05", duration: "06h 35m", days: ["M", "W", "S"], classes: [
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0086", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 720 }
  ]},
  { name: "Vande Bharat Express", no: "22436", from: "NDLS", to: "BSB", dep: "06:00", arr: "14:00", duration: "08h 00m", days: ["T", "W", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0034", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1640 },
    { code: "EC", name: "Exec Chair Car", status: "AVAILABLE - 0005", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2950 }
  ]},
  { name: "Pandian Express", no: "12637", from: "MAS", to: "MDU", dep: "21:40", arr: "05:15", duration: "07h 35m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0180", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 310 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0038", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 710 },
    { code: "2A", name: "AC 2 Tier", status: "RAC - 04", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20", fare: 995 }
  ]},
  { name: "Cheran Express", no: "12673", from: "MAS", to: "CBE", dep: "22:10", arr: "06:00", duration: "07h 50m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0072", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 320 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0022", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 750 },
    { code: "2A", name: "AC 2 Tier", status: "AVAILABLE - 0008", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1050 }
  ]},
  { name: "Rockfort Express", no: "12653", from: "MAS", to: "TPJ", dep: "23:35", arr: "05:15", duration: "05h 40m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0210", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 280 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0054", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 680 },
    { code: "2A", name: "AC 2 Tier", status: "WL - 14", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20", fare: 950 }
  ]},
  { name: "Vande Bharat Express (South)", no: "20643", from: "MAS", to: "CBE", dep: "14:25", arr: "20:15", duration: "05h 50m", days: ["M", "T", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0092", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1365 },
    { code: "EC", name: "Exec Chair Car", status: "AVAILABLE - 0014", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2490 }
  ]},
  { name: "Mumbai Rajdhani Express", no: "12951", from: "NDLS", to: "MMCT", dep: "16:55", arr: "08:35", duration: "15h 40m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0042", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2450 },
    { code: "2A", name: "AC 2 Tier", status: "AVAILABLE - 0015", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 3120 },
    { code: "1A", name: "AC First Class", status: "RAC - 01", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20", fare: 4890 }
  ]},
  { name: "Howrah Rajdhani Express", no: "12301", from: "NDLS", to: "HWH", dep: "16:50", arr: "09:55", duration: "17h 05m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0028", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2720 },
    { code: "2A", name: "AC 2 Tier", status: "AVAILABLE - 0010", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 3450 },
    { code: "1A", name: "AC First Class", status: "WL - 03", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20", fare: 5210 }
  ]},
  { name: "SBC Rajdhani Express", no: "22691", from: "NDLS", to: "SBC", dep: "20:00", arr: "05:20", duration: "33h 20m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0015", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2980 },
    { code: "2A", name: "AC 2 Tier", status: "AVAILABLE - 0004", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 3820 },
    { code: "1A", name: "AC First Class", status: "AVAILABLE - 0002", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 5850 }
  ]},
  { name: "MAS SBC Shatabdi Express", no: "12007", from: "MAS", to: "SBC", dep: "06:00", arr: "10:45", duration: "04h 45m", days: ["M", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0148", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 890 },
    { code: "EC", name: "Exec Chair Car", status: "AVAILABLE - 0022", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1450 }
  ]},
  { name: "Lalbagh Express", no: "12607", from: "MAS", to: "SBC", dep: "15:30", arr: "21:35", duration: "06h 05m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0210", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 410 }
  ]},
  { name: "Brindavan Express", no: "12639", from: "MAS", to: "SBC", dep: "07:40", arr: "13:50", duration: "06h 10m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0180", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 410 }
  ]},
  { name: "Chennai Bengaluru Mail", no: "12657", from: "MAS", to: "SBC", dep: "22:50", arr: "04:30", duration: "05h 40m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0064", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 310 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0018", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1150 }
  ]},
  { name: "Vaigai Express", no: "12635", from: "MAS", to: "MDU", dep: "13:50", arr: "21:20", duration: "07h 30m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0192", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 450 }
  ]},
  { name: "Chennai Madurai Tejas Express", no: "22671", from: "MAS", to: "MDU", dep: "06:00", arr: "12:15", duration: "06h 15m", days: ["M", "T", "W", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0086", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 980 },
    { code: "EC", name: "Exec Chair Car", status: "AVAILABLE - 0012", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1980 }
  ]},
  { name: "Chennai Coimbatore Shatabdi", no: "12243", from: "MAS", to: "CBE", dep: "07:10", arr: "14:15", duration: "07h 05m", days: ["M", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0110", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 980 },
    { code: "EC", name: "Exec Chair Car", status: "AVAILABLE - 0015", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1650 }
  ]},
  { name: "Coimbatore Intercity SF", no: "12679", from: "MAS", to: "CBE", dep: "14:30", arr: "22:15", duration: "07h 45m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0214", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 490 }
  ]},
  { name: "Chennai Mysuru Shatabdi", no: "12007", from: "MAS", to: "MYS", dep: "06:00", arr: "13:00", duration: "07h 00m", days: ["M", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0096", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 920 },
    { code: "EC", name: "Exec Chair Car", status: "AVAILABLE - 0008", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1880 }
  ]},
  { name: "Alleppey Express", no: "22639", from: "MAS", to: "ERS", dep: "20:55", arr: "06:40", duration: "09h 45m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0120", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 420 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0032", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1320 }
  ]},
  { name: "Deccan Queen", no: "12123", from: "MMCT", to: "PUNE", dep: "17:10", arr: "20:25", duration: "03h 15m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0240", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 450 },
    { code: "EC", name: "Exec Chair Car", status: "AVAILABLE - 0048", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 980 }
  ]},
  { name: "Charminar Express", no: "12760", from: "MAS", to: "SC", dep: "17:45", arr: "07:55", duration: "14h 10m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0096", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 420 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0036", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 980 },
    { code: "2A", name: "AC 2 Tier", status: "RAC - 08", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20", fare: 1420 }
  ]},
  { name: "Chennai Trivandrum Mail", no: "12623", from: "MAS", to: "TVC", dep: "19:45", arr: "11:30", duration: "15h 45m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0084", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 450 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0018", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1250 },
    { code: "2A", name: "AC 2 Tier", status: "RAC - 03", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20", fare: 1780 }
  ]},
  { name: "Kanyakumari Express", no: "12633", from: "MAS", to: "CAPE", dep: "17:15", arr: "06:10", duration: "12h 55m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0064", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 460 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0012", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1280 },
    { code: "2A", name: "AC 2 Tier", status: "AVAILABLE - 0005", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1820 }
  ]},
  { name: "Venad Express", no: "16302", from: "TVC", to: "ERS", dep: "05:00", arr: "09:45", duration: "04h 45m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0120", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 360 }
  ]},
  { name: "Chennai Mangaluru Mail", no: "12601", from: "MAS", to: "MAQ", dep: "20:10", arr: "12:10", duration: "16h 00m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0078", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 460 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0014", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1280 },
    { code: "2A", name: "AC 2 Tier", status: "RAC - 02", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20", fare: 1820 }
  ]},
  { name: "Pinakini Express", no: "12712", from: "MAS", to: "BZA", dep: "14:10", arr: "21:10", duration: "07h 00m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0180", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 380 }
  ]},
  { name: "Vizag Vande Bharat Express", no: "20834", from: "SC", to: "VSKP", dep: "15:00", arr: "23:30", duration: "08h 30m", days: ["M", "T", "W", "T", "F", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0086", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1450 },
    { code: "EC", name: "Exec Chair Car", status: "AVAILABLE - 0018", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2600 }
  ]},
  { name: "Tippu Express", no: "12614", from: "SBC", to: "MYS", dep: "11:30", arr: "14:00", duration: "02h 30m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0320", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 280 }
  ]},
  { name: "Nellai Express", no: "12631", from: "MAS", to: "TEN", dep: "20:10", arr: "08:00", duration: "11h 50m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0054", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 440 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0024", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1180 },
    { code: "2A", name: "AC 2 Tier", status: "RAC - 06", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20", fare: 1680 }
  ]},
  { name: "Kovai Express", no: "12675", from: "MAS", to: "CBE", dep: "06:10", arr: "13:50", duration: "07h 40m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0220", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 420 }
  ]},
  { name: "Kovai Express (via Salem)", no: "12675", from: "MAS", to: "SA", dep: "06:10", arr: "11:20", duration: "05h 10m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0180", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 360 }
  ]},
  { name: "Uday Express", no: "22665", from: "SBC", to: "CBE", dep: "14:15", arr: "21:00", duration: "06h 45m", days: ["M", "T", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0140", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 650 }
  ]},
  { name: "Ernakulam SF Express", no: "12677", from: "SBC", to: "ERS", dep: "06:10", arr: "16:55", duration: "10h 45m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0088", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 380 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0022", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1150 },
    { code: "2A", name: "AC 2 Tier", status: "RAC - 04", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20", fare: 1540 }
  ]},
  { name: "Ernakulam Express", no: "16306", from: "MAQ", to: "ERS", dep: "14:45", arr: "20:50", duration: "06h 05m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0165", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 320 }
  ]},
  { name: "Ratnachal Express", no: "12717", from: "VSKP", to: "BZA", dep: "12:55", arr: "19:15", duration: "06h 20m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0210", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 450 }
  ]},
  { name: "Kurla Express", no: "11014", from: "SA", to: "SBC", dep: "10:10", arr: "16:25", duration: "06h 15m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0064", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 280 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0012", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 790 }
  ]},
  { name: "Kovai Express (Local Link)", no: "12675", from: "SA", to: "CBE", dep: "11:20", arr: "13:50", duration: "02h 30m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0120", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 180 }
  ]},
  { name: "Gitanjali Express", no: "12860", from: "HWH", to: "MMCT", dep: "14:05", arr: "21:20", duration: "31h 15m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0045", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 820 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0012", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2120 },
    { code: "2A", name: "AC 2 Tier", status: "RAC - 05", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20", fare: 2950 }
  ]},
  { name: "Secunderabad Garibrath", no: "12736", from: "SBC", to: "SC", dep: "19:30", arr: "07:40", duration: "12h 10m", days: ["T", "T", "S"], classes: [
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0064", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 780 }
  ]},
  { name: "Pune Shatabdi Express", no: "12026", from: "PUNE", to: "SC", dep: "06:00", arr: "14:20", duration: "08h 20m", days: ["M", "T", "W", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0092", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1150 },
    { code: "EC", name: "Exec Chair Car", status: "AVAILABLE - 0011", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2100 }
  ]},
  { name: "Pune Duronto Express", no: "12264", from: "NDLS", to: "PUNE", dep: "11:10", arr: "07:10", duration: "20h 00m", days: ["M", "T", "T", "F"], classes: [
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0022", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2210 },
    { code: "2A", name: "AC 2 Tier", status: "AVAILABLE - 0005", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 3150 },
    { code: "1A", name: "AC First Class", status: "AVAILABLE - 0002", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 4680 }
  ]},
  { name: "Udyan Express", no: "11301", from: "MMCT", to: "SBC", dep: "08:10", arr: "08:50", duration: "24h 40m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0054", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 620 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0015", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1680 }
  ]},
  { name: "Lucknow Swarn Shatabdi", no: "12003", from: "LJN", to: "CNB", dep: "15:35", arr: "16:45", duration: "01h 10m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0310", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 320 }
  ]},
  { name: "Coromandel Express", no: "12841", from: "HWH", to: "MAS", dep: "15:20", arr: "17:00", duration: "25h 40m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0048", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 810 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0018", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2280 }
  ]},
  { name: "Falaknuma Express", no: "12704", from: "SC", to: "HWH", dep: "15:55", arr: "17:45", duration: "25h 50m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0092", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 820 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0022", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 2310 }
  ]},
  { name: "Chandigarh Express", no: "12241", from: "NDLS", to: "CDG", dep: "19:15", arr: "22:30", duration: "03h 15m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0120", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 480 },
    { code: "EC", name: "Exec Chair Car", status: "AVAILABLE - 0024", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 955 }
  ]},
  { name: "Chandigarh Express (Delhi-Panipat)", no: "12241", from: "NDLS", to: "PNP", dep: "19:15", arr: "20:20", duration: "01h 05m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0148", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 180 }
  ]},
  { name: "Chandigarh Express (Delhi-Ambala)", no: "12241", from: "NDLS", to: "UMB", dep: "19:15", arr: "21:40", duration: "02h 25m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0086", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 320 },
    { code: "EC", name: "Exec Chair Car", status: "AVAILABLE - 0012", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 680 }
  ]},
  { name: "Chandigarh Express (Panipat-Ambala)", no: "12241", from: "PNP", to: "UMB", dep: "20:20", arr: "21:40", duration: "01h 20m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0210", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 180 }
  ]},
  { name: "Chandigarh Express (Ambala-Chandigarh)", no: "12241", from: "UMB", to: "CDG", dep: "21:40", arr: "22:30", duration: "00h 50m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0110", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 120 },
    { code: "EC", name: "Exec Chair Car", status: "AVAILABLE - 0004", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 280 }
  ]},
  { name: "Chandigarh Express (Panipat-Chandigarh)", no: "12241", from: "PNP", to: "CDG", dep: "20:20", arr: "22:30", duration: "02h 10m", days: ["M", "T", "W", "T", "F", "S", "S"], classes: [
    { code: "CC", name: "AC Chair Car", status: "AVAILABLE - 0096", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 280 }
  ]},
  { name: "Sampark Kranti Express", no: "12651", from: "MDU", to: "BZA", dep: "00:55", arr: "14:20", duration: "13h 25m", days: ["T", "S"], classes: [
    { code: "SL", name: "Sleeper Class", status: "AVAILABLE - 0086", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 480 },
    { code: "3A", name: "AC 3 Tier", status: "AVAILABLE - 0024", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1280 },
    { code: "2A", name: "AC 2 Tier", status: "AVAILABLE - 0008", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20", fare: 1840 }
  ]},
];

export function TicketBooking({ onBookSuccess, bookTicketAction }: TicketBookingProps) {
  const [fromCode, setFromCode] = useState("MAS");
  const [toCode, setToCode] = useState("MDU");
  const [quota, setQuota] = useState("GENERAL");
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });

  // Searching status
  const [hasSearched, setHasSearched] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState<TrainType | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  // Passenger form states
  const [passengerName, setPassengerName] = useState("");
  const [passengerAge, setPassengerAge] = useState("");
  const [passengerGender, setPassengerGender] = useState("Male");
  const [berthPreference, setBerthPreference] = useState("Lower");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<BookingResult | null>(null);

  // Filter matching trains
  const matchingTrains = TRAINS.filter(
    (train) => 
      (train.from === fromCode && train.to === toCode) ||
      (train.from === toCode && train.to === fromCode)
  );

  const handleSwapStations = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
    setSelectedTrain(null);
    setSelectedClass(null);
  };

  const handleSearch = () => {
    setHasSearched(true);
    setSelectedTrain(null);
    setSelectedClass(null);
    setError(null);
  };

  const selectTrainClass = (train: TrainType, classItem: ClassItem) => {
    setSelectedTrain(train);
    setSelectedClass(classItem);
    setError(null);
  };

  const handleBook = () => {
    setError(null);
    if (!passengerName.trim()) {
      setError("Please enter passenger name.");
      return;
    }
    if (!passengerAge || isNaN(Number(passengerAge))) {
      setError("Please enter a valid passenger age.");
      return;
    }
    if (!selectedTrain || !selectedClass) {
      setError("Please select a train and class.");
      return;
    }

    startTransition(async () => {
      const fromStationName = STATIONS.find((s) => s.code === fromCode)?.name || fromCode;
      const toStationName = STATIONS.find((s) => s.code === toCode)?.name || toCode;

      const res = await bookTicketAction({
        trainName: selectedTrain.name,
        trainNo: selectedTrain.no,
        fromCode,
        from: fromStationName,
        toCode,
        to: toStationName,
        travelClass: selectedClass.code,
        passengerName: `${passengerName} (Age: ${passengerAge}, ${passengerGender})`,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setSuccessBooking(res.booking ?? null);
        onBookSuccess();
      }
    });
  };

  // Modern Confirmation IRCTC E-Ticket View
  if (successBooking) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">IRCTC Authorized Agent Booking</span>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Print Ticket
          </button>
        </div>

        {/* The E-Ticket layout */}
        <div className="border-4 border-[#c05621] bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl relative">
          
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <Train className="w-96 h-96 text-[#c05621]" />
          </div>

          {/* Ticket Header */}
          <div className="bg-[#c05621] text-white p-4 flex items-center justify-between border-b-2 border-amber-600">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-white">
                <Train className="w-8 h-8 text-[#c05621]" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight uppercase">INDIAN RAILWAYS</h1>
                <p className="text-[10px] text-amber-100 uppercase tracking-widest font-bold">Electronic Reservation Slip (ERS)</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-200 block uppercase font-bold">PNR Number</span>
              <span className="text-xl font-mono font-black tracking-wider text-amber-100">{successBooking.pnr}</span>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Journey Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Train Detail</span>
                <span className="text-sm font-bold text-slate-900">{successBooking.trainName}</span>
                <span className="text-xs text-slate-600 block">Train No: #{successBooking.trainNo}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Journey</span>
                <span className="text-sm font-bold text-slate-900">
                  {new Date(successBooking.dateOfJourney).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <span className="text-xs text-slate-600 block">Quota: {quota}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Class & Status</span>
                <span className="text-sm font-bold text-emerald-600 uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {successBooking.status} (Confirmed)
                </span>
                <span className="text-xs text-slate-600 block">Coach/Seat: {successBooking.seat}</span>
              </div>
            </div>

            {/* From/To Stations timeline */}
            <div className="flex items-center justify-between border-y border-slate-100 py-4 px-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#c05621] block">{fromCode}</span>
                <span className="text-sm font-black text-slate-800">
                  {STATIONS.find((s) => s.code === fromCode)?.name || fromCode}
                </span>
                <span className="text-xs text-slate-500 block">Depart: {selectedTrain?.dep || "18:00"}</span>
              </div>
              <div className="flex-1 flex flex-col items-center px-4">
                <span className="text-[10px] text-slate-400 font-bold font-mono">{selectedTrain?.duration || "12h 00m"}</span>
                <div className="w-full flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#c05621]" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                  <Train className="w-4 h-4 text-[#c05621]" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                </div>
                <span className="text-[9px] text-emerald-600 font-bold mt-1 uppercase">Direct Route</span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-xs font-bold text-[#c05621] block">{toCode}</span>
                <span className="text-sm font-black text-slate-800">
                  {STATIONS.find((s) => s.code === toCode)?.name || toCode}
                </span>
                <span className="text-xs text-slate-500 block">Arrive: {selectedTrain?.arr || "06:00"}</span>
              </div>
            </div>

            {/* Passenger Details Table */}
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Passenger Information</h2>
              <table className="w-full text-left text-xs border border-slate-150 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-150">
                    <th className="p-2.5 font-bold">#</th>
                    <th className="p-2.5 font-bold">Passenger Name</th>
                    <th className="p-2.5 font-bold">Berth Pref</th>
                    <th className="p-2.5 font-bold">Booking Status</th>
                    <th className="p-2.5 font-bold">Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 text-slate-800">
                    <td className="p-2.5">1</td>
                    <td className="p-2.5 font-bold">{passengerName} (Age: {passengerAge}, {passengerGender})</td>
                    <td className="p-2.5">{berthPreference}</td>
                    <td className="p-2.5 text-slate-500">CNF / {successBooking.seat.split("/")[0]}</td>
                    <td className="p-2.5 font-bold text-emerald-600">CNF / {successBooking.seat}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom QR and Barcode Simulation */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <QrCode className="w-14 h-14 text-slate-700" />
                </div>
                <div className="text-left space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Ticket Verification</span>
                  <p className="text-[11px] text-slate-500 leading-tight max-w-[280px]">
                    Scan QR code on station check-in or present to Ticket Collector (TTE) along with valid Govt ID.
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Transaction ID</span>
                <span className="text-xs font-mono font-bold text-slate-700">TXN-49205193084-26</span>
                <span className="text-[10px] text-slate-400 block mt-1">Booked on: {new Date().toLocaleDateString("en-GB")}</span>
              </div>
            </div>
          </div>

          {/* Footer banner */}
          <div className="bg-slate-50 p-3 text-center border-t border-slate-150 text-[10px] text-slate-500 font-medium">
            Wish you a happy and comfortable journey! Thank you for booking with ixigo.
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center">
          <Button
            onClick={() => {
              setSuccessBooking(null);
              setSelectedTrain(null);
              setSelectedClass(null);
              setPassengerName("");
              setPassengerAge("");
            }}
            className="bg-[#c05621] hover:bg-[#a64819] text-white rounded-xl shadow-lg shadow-[#c05621]/15 px-6 font-semibold"
          >
            Book Another Ticket
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* 1. IRCTC Search Header */}
      <Card className="border border-[#eaddcd] dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 backdrop-blur-md shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-[#c05621] to-amber-700 text-white p-5 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Train className="w-5 h-5" />
            <CardTitle className="text-lg font-bold tracking-tight">Book Train Tickets</CardTitle>
          </div>
          <CardDescription className="text-amber-100 text-xs">
            Search trains, check live seat availability, and book confirmed tickets instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* From Station */}
            <div className="md:col-span-3 space-y-1">
              <Label htmlFor="from" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#c05621]" /> From
              </Label>
              <select
                id="from"
                value={fromCode}
                onChange={(e) => {
                  setFromCode(e.target.value);
                  setSelectedTrain(null);
                  setSelectedClass(null);
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {STATIONS.map((station) => (
                  <option key={station.code} value={station.code} disabled={station.code === toCode}>
                    {station.name} ({station.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center pt-2 md:pt-4">
              <button
                type="button"
                onClick={handleSwapStations}
                className="p-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-amber-300 bg-white dark:bg-slate-900 shadow-xs text-[#c05621] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* To Station */}
            <div className="md:col-span-3 space-y-1">
              <Label htmlFor="to" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#c05621]" /> To
              </Label>
              <select
                id="to"
                value={toCode}
                onChange={(e) => {
                  setToCode(e.target.value);
                  setSelectedTrain(null);
                  setSelectedClass(null);
                }}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {STATIONS.map((station) => (
                  <option key={station.code} value={station.code} disabled={station.code === fromCode}>
                    {station.name} ({station.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="date" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#c05621]" /> Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-xs sm:text-sm rounded-xl bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
              />
            </div>

            {/* Quota */}
            <div className="md:col-span-2 space-y-1">
              <Label htmlFor="quota" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3 text-[#c05621]" /> Quota
              </Label>
              <select
                id="quota"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="GENERAL">General</option>
                <option value="TATKAL">Tatkal</option>
                <option value="LADIES">Ladies</option>
                <option value="LOWER_BERTH">Sr. Citizen / Lower Berth</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="md:col-span-1 pt-3 md:pt-4 flex justify-end">
              <Button
                onClick={handleSearch}
                className="w-full h-9 bg-[#c05621] hover:bg-[#a64819] text-white rounded-xl shadow-xs"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* 2. Train Results & Booking split view */}
      {hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Train list */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              {matchingTrains.length} Direct Trains Found
            </h2>

            {matchingTrains.length > 0 ? (
              matchingTrains.map((train) => (
                <Card 
                  key={train.no}
                  className={`border transition-all rounded-2xl overflow-hidden shadow-xs hover:shadow-md ${
                    selectedTrain?.no === train.no 
                      ? "border-[#c05621] bg-orange-50/5 dark:bg-slate-900/10" 
                      : "border-[#eaddcd] dark:border-slate-800 bg-white dark:bg-slate-950"
                  }`}
                >
                  <CardContent className="p-4 space-y-4">
                    {/* Header: Train name & no */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-850 dark:text-slate-100 text-sm flex items-center gap-2">
                          <Train className="w-4 h-4 text-[#c05621]" />
                          {train.name} 
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-mono font-bold px-1.5 py-0.5 rounded">
                            #{train.no}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-1">
                          Runs on: {train.days.map((d, i) => (
                            <span key={i} className="mr-1 inline-block text-amber-700 dark:text-amber-500 font-extrabold">{d}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <ShieldCheck className="w-3.5 h-3.5" /> Live Tracking Active
                      </div>
                    </div>

                    {/* Timeline row */}
                    <div className="flex items-center justify-between text-xs border-y border-slate-100 dark:border-slate-900 py-3">
                      <div>
                        <div className="font-black text-slate-800 dark:text-white text-sm">{train.dep}</div>
                        <div className="text-[10px] text-slate-500">{fromCode}</div>
                      </div>
                      <div className="flex-1 px-4 flex flex-col items-center">
                        <span className="text-[9px] font-mono text-slate-450 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {train.duration}
                        </span>
                        <div className="w-full flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#c05621]" />
                          <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-850" />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-800 dark:text-white text-sm">{train.arr}</div>
                        <div className="text-[10px] text-slate-500">{toCode}</div>
                      </div>
                    </div>

                    {/* Class Availability Selection Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {train.classes.map((cls) => {
                        const isSelected = selectedTrain?.no === train.no && selectedClass?.code === cls.code;
                        return (
                          <button
                            key={cls.code}
                            type="button"
                            onClick={() => selectTrainClass(train, cls)}
                            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between h-20 transition-all ${
                              isSelected
                                ? "border-[#c05621] bg-orange-100/10 dark:bg-orange-950/10 shadow-xs"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-amber-200 dark:hover:border-slate-800"
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">{cls.name} ({cls.code})</span>
                              <span className="text-[11px] font-extrabold text-[#c05621] dark:text-orange-450">₹{cls.fare}</span>
                            </div>
                            <span className={`text-[10px] font-black mt-2 leading-none ${cls.color}`}>
                              {cls.status}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 text-center space-y-2">
                <Info className="w-8 h-8 text-amber-600 mx-auto" />
                <div className="font-bold text-slate-800 dark:text-white text-sm">No Direct Trains Found</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try routing from Chennai Central (MAS) to Madurai Jn (MDU) or Coimbatore Jn (CBE).
                </p>
              </div>
            )}
          </div>

          {/* Right panel: Passenger Details & Billing Card */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Booking Details
            </h2>

            {selectedClass ? (
              <Card className="border border-[#c05621]/30 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-lg p-5 space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                <div className="border-b border-slate-100 dark:border-slate-900 pb-3">
                  <span className="text-[10px] uppercase font-bold text-[#c05621] dark:text-orange-450 tracking-wider block">Selected Travel Segment</span>
                  <div className="font-bold text-slate-850 dark:text-white text-sm mt-0.5">{selectedTrain?.name} (#{selectedTrain?.no})</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {fromCode} ⇆ {toCode} • Class: {selectedClass.name} ({selectedClass.code})
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="pass-name" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Passenger Full Name</Label>
                    <Input
                      id="pass-name"
                      placeholder="Enter traveler name"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      disabled={isPending}
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm h-9"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="pass-age" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Age</Label>
                      <Input
                        id="pass-age"
                        type="number"
                        placeholder="Age"
                        value={passengerAge}
                        onChange={(e) => setPassengerAge(e.target.value)}
                        disabled={isPending}
                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pass-gender" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gender</Label>
                      <select
                        id="pass-gender"
                        value={passengerGender}
                        onChange={(e) => setPassengerGender(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 h-9"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="berth" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Berth Preference</Label>
                    <select
                      id="berth"
                      value={berthPreference}
                      onChange={(e) => setBerthPreference(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 h-9"
                    >
                      <option value="Lower">Lower Berth</option>
                      <option value="Middle">Middle Berth</option>
                      <option value="Upper">Upper Berth</option>
                      <option value="Side Lower">Side Lower Berth</option>
                      <option value="Side Upper">Side Upper Berth</option>
                    </select>
                  </div>
                </div>

                {/* Visual Seat Map Representation */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 rounded-xl space-y-2">
                  <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Berth Arrangement Visualizer
                  </span>
                  <div className="grid grid-cols-6 gap-1 bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-900 text-[10px] font-bold text-center">
                    <div className={`p-1.5 rounded ${berthPreference === "Lower" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-550"}`}>LB</div>
                    <div className={`p-1.5 rounded ${berthPreference === "Middle" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-550"}`}>MB</div>
                    <div className={`p-1.5 rounded ${berthPreference === "Upper" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-550"}`}>UB</div>
                    <div className="p-1 text-slate-300 dark:text-slate-700 flex items-center justify-center">|</div>
                    <div className={`p-1.5 rounded ${berthPreference === "Side Lower" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-550"}`}>SL</div>
                    <div className={`p-1.5 rounded ${berthPreference === "Side Upper" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-550"}`}>SU</div>
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Base Ticket Fare</span>
                    <span className="font-bold text-slate-800 dark:text-white">₹{selectedClass.fare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IRCTC Agent Booking Fee</span>
                    <span className="font-bold text-slate-850 dark:text-white">₹20</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-900 pt-2 text-sm font-bold">
                    <span className="text-slate-800 dark:text-white">Total Amount</span>
                    <span className="text-[#c05621] dark:text-orange-450 text-base font-extrabold">₹{selectedClass.fare + 20}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* Booking Button */}
                <Button
                  onClick={handleBook}
                  disabled={isPending}
                  className="w-full bg-[#c05621] hover:bg-[#a64819] text-white font-semibold rounded-xl shadow-md h-10 transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing Booking...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Proceed to Book
                    </>
                  )}
                </Button>
              </Card>
            ) : (
              <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950 p-8 text-center rounded-2xl">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="font-bold text-slate-800 dark:text-white text-sm">Select Train & Class</div>
                <p className="text-xs text-slate-500 max-w-[240px] mx-auto mt-1">
                  Choose a train class card on the left to activate passenger details and billing form.
                </p>
              </Card>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
