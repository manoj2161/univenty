import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import mongoose from "mongoose";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

// @desc    Generate & download PDF certificate for a registration
// @route   GET /api/registrations/:id/certificate
// @access  Private (owner student or organiser or admin)
export const downloadCertificate = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid registration ID" });
    }
    const registration = await Registration.findById(req.params.id)
      .populate("student", "name email")
      .populate({
        path: "event",
        populate: { path: "organiser", select: "name" },
      });

    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    // Access check: owner student or admin
    const isOwner = registration.student._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (registration.status !== "Approved") {
      return res.status(400).json({ success: false, message: "Certificate is only available for approved registrations." });
    }
    if (!registration.checkedIn) {
      return res.status(403).json({ success: false, message: "Certificate is available after event attendance has been verified." });
    }
    if (!registration.certificateIssued) {
      return res.status(403).json({ success: false, message: "The organiser has not issued this certificate yet." });
    }

    const { student, event } = registration;
    const eventDate = new Date(event.eventDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Build PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();

    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Background
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.98, 0.97, 0.95) });

    // Olive border
    const borderPad = 20;
    page.drawRectangle({
      x: borderPad, y: borderPad,
      width: width - borderPad * 2, height: height - borderPad * 2,
      borderColor: rgb(0.29, 0.37, 0.23),
      borderWidth: 4,
      color: rgb(0.98, 0.97, 0.95),
    });
    page.drawRectangle({
      x: borderPad + 8, y: borderPad + 8,
      width: width - (borderPad + 8) * 2, height: height - (borderPad + 8) * 2,
      borderColor: rgb(0.70, 0.64, 0.50),
      borderWidth: 1.5,
      color: rgb(0.98, 0.97, 0.95),
    });

    // Header: UNIVENTY
    page.drawText("UNIVENTY", {
      x: width / 2 - timesRomanBold.widthOfTextAtSize("UNIVENTY", 14) / 2,
      y: height - 60,
      size: 14,
      font: timesRomanBold,
      color: rgb(0.29, 0.37, 0.23),
    });

    page.drawText("University Events Management Platform", {
      x: width / 2 - helvetica.widthOfTextAtSize("University Events Management Platform", 10) / 2,
      y: height - 76,
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.45),
    });

    // Divider
    page.drawLine({
      start: { x: borderPad + 40, y: height - 90 },
      end: { x: width - borderPad - 40, y: height - 90 },
      thickness: 1.5,
      color: rgb(0.29, 0.37, 0.23),
    });

    // Certificate of Participation
    const certTitle = "Certificate of Participation";
    page.drawText(certTitle, {
      x: width / 2 - timesRomanBold.widthOfTextAtSize(certTitle, 32) / 2,
      y: height - 155,
      size: 32,
      font: timesRomanBold,
      color: rgb(0.15, 0.15, 0.1),
    });

    // Presented to
    const presentedTo = "This certificate is proudly presented to";
    page.drawText(presentedTo, {
      x: width / 2 - timesRoman.widthOfTextAtSize(presentedTo, 14) / 2,
      y: height - 195,
      size: 14,
      font: timesRoman,
      color: rgb(0.4, 0.4, 0.35),
    });

    // Student name
    const studentName = student.name;
    page.drawText(studentName, {
      x: width / 2 - timesRomanBold.widthOfTextAtSize(studentName, 36) / 2,
      y: height - 255,
      size: 36,
      font: timesRomanBold,
      color: rgb(0.29, 0.37, 0.23),
    });

    // Name underline
    const nameWidth = timesRomanBold.widthOfTextAtSize(studentName, 36);
    page.drawLine({
      start: { x: width / 2 - nameWidth / 2, y: height - 262 },
      end: { x: width / 2 + nameWidth / 2, y: height - 262 },
      thickness: 2,
      color: rgb(0.70, 0.64, 0.50),
    });

    // For participating in
    const forPart = "for successfully participating in";
    page.drawText(forPart, {
      x: width / 2 - timesRoman.widthOfTextAtSize(forPart, 14) / 2,
      y: height - 300,
      size: 14,
      font: timesRoman,
      color: rgb(0.4, 0.4, 0.35),
    });

    // Event name
    const evtName = event.name;
    const evtNameSize = evtName.length > 40 ? 20 : 24;
    page.drawText(evtName, {
      x: width / 2 - helveticaBold.widthOfTextAtSize(evtName, evtNameSize) / 2,
      y: height - 338,
      size: evtNameSize,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.08),
    });

    // Date & organiser
    const dateOrg = `Held on ${eventDate}  •  Organised by ${event.organiser?.name || "Univenty"}`;
    page.drawText(dateOrg, {
      x: width / 2 - helvetica.widthOfTextAtSize(dateOrg, 11) / 2,
      y: height - 365,
      size: 11,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.45),
    });

    // Divider bottom
    page.drawLine({
      start: { x: borderPad + 40, y: 100 },
      end: { x: width - borderPad - 40, y: 100 },
      thickness: 1,
      color: rgb(0.75, 0.75, 0.70),
    });

    // Signature areas
    page.drawText("Organiser", {
      x: 120,
      y: 78,
      size: 10,
      font: helveticaBold,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawLine({ start: { x: 90, y: 90 }, end: { x: 200, y: 90 }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });

    page.drawText("Administrator", {
      x: width - 215,
      y: 78,
      size: 10,
      font: helveticaBold,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawLine({ start: { x: width - 220, y: 90 }, end: { x: width - 110, y: 90 }, thickness: 1, color: rgb(0.6, 0.6, 0.6) });

    // Verification hash (bottom center)
    const hash = `Cert-${registration._id.toString().slice(-8).toUpperCase()}`;
    page.drawText(`Verification ID: ${hash}`, {
      x: width / 2 - helvetica.widthOfTextAtSize(`Verification ID: ${hash}`, 9) / 2,
      y: 50,
      size: 9,
      font: helvetica,
      color: rgb(0.65, 0.65, 0.6),
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${event.name.replace(/\s+/g, "-")}.pdf"`
    );
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Certificate generation error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Issue certificates for checked-in attendees of an event
// @route   POST /api/admin/events/:id/issue-certificates OR /api/registrations/event/:eventId/issue-certificates
// @access  Admin or event organiser
export const issueCertificates = async (req, res) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    if (!req.user?.isAdmin && event.organiser.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ success: false, message: "You can only issue certificates for your own events." });
    }

    const result = await Registration.updateMany(
      { event: eventId, status: "Approved", checkedIn: true, certificateIssued: { $ne: true } },
      { $set: { certificateIssued: true } }
    );
    return res.json({
      success: true,
      message: `Certificates issued for ${result.modifiedCount} checked-in attendees.`,
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error("issueCertificates Error:", error);
    return res.status(500).json({ success: false, message: "Unable to issue certificates." });
  }
};
