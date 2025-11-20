const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const axios = require("axios");
const Purchase = require("../models/PurchaseModel");
const Book = require("../models/BookModel");


exports.generateInvoice = async (req, res) => {
  try {
    const purchaseId = req.params.id;

    // 👉 Fetch purchase + book info
    const purchase = await Purchase.findById(purchaseId).populate("book");
    if (!purchase)
      return res.status(404).json({ success: false, message: "Purchase not found" });

    const book = purchase.book;

    // ----------------------------------------
    // 👉 Reverse Geocoding (Seller Location)
    // ----------------------------------------
    let sellerCity = "Unknown";
    if (book.location?.coordinates) {
      const [lng, lat] = book.location.coordinates;
      try {
        const geoRes = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        sellerCity = geoRes.data.address?.city ||
                     geoRes.data.address?.town ||
                     geoRes.data.address?.state ||
                     "Unknown";
      } catch (err) {
        console.log("Geocoding failed");
      }
    }

    // ----------------------------------------
    // 👉 QR CODE (Payment verification link)
    // ----------------------------------------
    const qrData = `Payment ID: ${purchase.paymentId}\nOrder ID: ${purchase.orderId}`;
    const qrImage = await QRCode.toDataURL(qrData);

    // ----------------------------------------
    // 👉 Start PDF
    // ----------------------------------------
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${purchaseId}.pdf`
    );

    doc.pipe(res);

    // ----------------------------------------
    // 👉 HEADER WITH LOGO
    // ----------------------------------------
    doc.image("", 40, 40, { width: 70 }) // <-- Add logo file in /public/logo.png
      .fontSize(26)
      .fillColor("#e11d48")
      .text("BookShare Invoice", 130, 40);

    doc.moveDown(2);

    // Divider
    doc
      .moveTo(40, 120)
      .lineTo(560, 120)
      .stroke("#e11d48");

    doc.moveDown(2);

    // ----------------------------------------
    // 👉 INVOICE INFO (Left) + QR Code (Right)
    // ----------------------------------------
    doc.fontSize(12).fillColor("#333");

    doc.text(`Invoice Number: ${purchase._id}`);
    doc.text(`Order ID (Razorpay): ${purchase.orderId}`);
    doc.text(`Payment ID (Razorpay): ${purchase.paymentId}`);
    doc.text(`Payment Gateway: Razorpay`);
    doc.text(`Status: ${purchase.status}`);
    doc.text(
      `Date: ${new Date(purchase.createdAt).toLocaleString()}`,
      { lineGap: 4 }
    );

    // Draw QR Code on the right
    doc.image(qrImage, 430, 130, { width: 120 });

    doc.moveDown(3);

    // ----------------------------------------
    // 👉 BUYER + SELLER DETAILS SECTION
    // ----------------------------------------
    doc
      .fontSize(16)
      .fillColor("#e11d48")
      .text("Buyer & Seller Details");

    doc.moveDown(0.5);

    doc.fontSize(12).fillColor("#000");
    doc.text(`Buyer UID: ${purchase.buyer}`);
    doc.text(`Seller Name: ${book.seller?.name || "Unknown"}`);
    doc.text(`Seller Email: ${book.seller?.email || "N/A"}`);
    doc.text(`Seller Location: ${sellerCity}`);

    doc.moveDown(2);

    // ----------------------------------------
    // 👉 BOOK DETAILS (TABLE + IMAGE)
    // ----------------------------------------
    doc
      .fontSize(16)
      .fillColor("#e11d48")
      .text("Book Details");

    doc.moveDown(1);

    // Book cover image
    if (book.imageUrl) {
      try {
        const img = await axios.get(book.imageUrl, { responseType: "arraybuffer" });
        const imgBuffer = Buffer.from(img.data, "base64");
        doc.image(imgBuffer, 40, doc.y, { width: 100, height: 140 });
      } catch (err) {
        console.log("Book image failed to load");
      }
    }

    doc.fontSize(12).fillColor("#000");

    const startY = doc.y + 10;

    doc.text(`Title: ${book.title}`, 160, startY);
    doc.text(`Author: ${book.author}`, 160, startY + 15);
    doc.text(`Category: ${book.category || "N/A"}`, 160, startY + 30);
    doc.text(`Price: ₹${book.price}`, 160, startY + 45);
    doc.text(
      `Description: ${
        book.description ? book.description.substring(0, 120) + "..." : "N/A"
      }`,
      160,
      startY + 60,
      { width: 350 }
    );

    doc.moveDown(5);

    // ----------------------------------------
    // 👉 PAYMENT SUMMARY TABLE
    // ----------------------------------------
    doc
      .fontSize(16)
      .fillColor("#e11d48")
      .text("Payment Summary");

    doc.moveDown(1);

    const amount = purchase.amount;
    const gst = (amount * 0.05).toFixed(2);
    const total = (amount + Number(gst)).toFixed(2);

    // Draw table box
    doc
      .roundedRect(40, doc.y, 520, 100, 6)
      .stroke("#e11d48");

    const tableTop = doc.y + 10;

    doc.fontSize(12).fillColor("#000");

    doc.text(`Book Price: ₹${amount}`, 60, tableTop);
    doc.text(`GST (5%): ₹${gst}`, 60, tableTop + 20);

    doc.font("Helvetica-Bold").text(
      `Total Amount Paid: ₹${total}`,
      60,
      tableTop + 50
    );

    doc.font("Helvetica").fillColor("#000");

    doc.moveDown(6);

    // ----------------------------------------
    // 👉 FOOTER
    // ----------------------------------------
    doc
      .fontSize(12)
      .fillColor("#e11d48")
      .text("Thank you for purchasing from BookShare!", { align: "center" });

    doc.moveDown(0.4);

    doc
      .fontSize(9)
      .fillColor("#999")
      .text(
        "This is a system-generated invoice. No signature required.",
        { align: "center" }
      );

    // End PDF
    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Could not generate invoice",
    });
  }
};