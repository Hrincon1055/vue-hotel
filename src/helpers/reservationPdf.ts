import { jsPDF } from 'jspdf';

interface ReservationPdfData {
  reservationCode: string;
  createdAt: string;
  checkInDate: string;
  checkOutDate: string;
  customer: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    documentType?: string;
    documentNumber?: string;
  };
  room: {
    number: string;
    type: string;
  };
  adults: number;
  children: number;
  totalAmount: number | string;
  status: string;
  notes?: string;
}

const getRoomTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    SINGLE: 'Individual',
    DOUBLE: 'Doble',
    TWIN: 'Twin',
    SUITE: 'Suite',
    DELUXE: 'Deluxe',
    PRESIDENTIAL: 'Presidencial',
    FAMILY: 'Familiar',
  };
  return labels[type] ?? type;
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    CHECKED_IN: 'Check-in',
    CHECKED_OUT: 'Check-out',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No Show',
  };
  return labels[status] ?? status;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(numAmount)) return '$0.00';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount);
};

const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatShortDate = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getDate()}/${date.toLocaleString('es-ES', { month: 'short' })}`;
};

// ─── Multi-Room PDF ──────────────────────────────────────────────────────────

interface MultiRoomPdfRoom {
  number: string;
  type: string;
  reservationCode: string;
  adults: number;
  children: number;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalAmount: number | string;
}

interface MultiRoomReservationPdfData {
  reservationCode: string;
  createdAt: string;
  checkInDate: string;
  checkOutDate: string;
  customer: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    documentType?: string;
    documentNumber?: string;
  };
  rooms: MultiRoomPdfRoom[];
  totalAmount: number | string;
  notes?: string;
}

export function generateMultiRoomReservationPdf(reservation: MultiRoomReservationPdfData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Hotel Manager', 20, y);

  doc.setFontSize(24);
  doc.setTextColor(180, 0, 0);
  doc.text('Reserva Multi-Habitación', pageWidth - 20, y, { align: 'right' });

  y += 15;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestión Hotelera', 20, y);

  doc.text(`No ${reservation.reservationCode}`, pageWidth - 20, y, { align: 'right' });
  y += 5;
  doc.text(
    `Fecha: ${new Date(reservation.createdAt).toLocaleDateString('es-ES')}`,
    pageWidth - 20,
    y,
    { align: 'right' },
  );

  y += 15;

  // Cliente
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${reservation.customer.firstName} ${reservation.customer.lastName}`, 50, y);

  doc.text(`Fecha de expiración: ${formatDate(reservation.checkOutDate)}`, pageWidth - 20, y, {
    align: 'right',
  });

  y += 6;

  if (reservation.customer.documentType && reservation.customer.documentNumber) {
    doc.text(`${reservation.customer.documentType}: ${reservation.customer.documentNumber}`, 20, y);
    y += 6;
  }

  if (reservation.customer.phone) {
    doc.text(`TEL: ${reservation.customer.phone}`, 20, y);
    y += 6;
  }

  if (reservation.customer.email) {
    doc.text(`Correo: ${reservation.customer.email}`, 20, y);
    y += 6;
  }

  doc.text(`Fecha inicio de servicio: ${formatDate(reservation.checkInDate)}`, 20, y);

  y += 15;

  // Tabla de habitaciones
  const tableX = 20;
  const tableWidth = pageWidth - 40;
  // #, Habitación, Huéspedes, Check-in, Check-out, Estado, Total
  // Sum of fixed: 8+38+20+22+22+26 = 136 → Total = tableWidth - 136 ≈ 34mm
  const colWidths = [8, 38, 20, 22, 22, 26, tableWidth - 136];
  const headers = ['#', 'Habitación', 'Huéspedes', 'Check-in', 'Check-out', 'Estado', 'Total'];
  const rowHeight = 12;

  const drawRow = (rowData: string[], yPos: number, isHeader: boolean) => {
    if (isHeader) {
      doc.setFillColor(240, 240, 240);
      doc.rect(tableX, yPos - 4, tableWidth, rowHeight, 'F');
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    let xPos = tableX + 2;
    for (let i = 0; i < rowData.length; i++) {
      const cellWidth = colWidths[i] ?? 0;
      const text = rowData[i] ?? '';
      const textWidth = doc.getTextWidth(text);
      const centeredX = xPos + (cellWidth - textWidth) / 2;
      doc.text(text, centeredX, yPos + 2);
      xPos += cellWidth;
    }
  };

  // Encabezado
  drawRow(headers, y, true);
  y += rowHeight;

  // Filas de habitaciones
  reservation.rooms.forEach((room, index) => {
    const rowData = [
      String(index + 1),
      `${room.number} (${getRoomTypeLabel(room.type)})`,
      String(room.adults + room.children),
      formatShortDate(room.checkInDate),
      formatShortDate(room.checkOutDate),
      getStatusLabel(room.status),
      formatCurrency(room.totalAmount),
    ];
    drawRow(rowData, y, false);
    y += rowHeight;
  });

  // Bordes de la tabla
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  const tableHeight = rowHeight * (reservation.rooms.length + 1) + 4;
  doc.rect(tableX, y - tableHeight, tableWidth, tableHeight);
  doc.line(tableX, y - tableHeight + rowHeight, tableX + tableWidth, y - tableHeight + rowHeight);

  let lineX = tableX;
  for (let i = 0; i < colWidths.length - 1; i++) {
    lineX += colWidths[i] ?? 0;
    doc.line(lineX, y - tableHeight, lineX, y);
  }

  y += 10;

  // Notas
  if (reservation.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Notas: ${reservation.notes}`, 20, y);
    y += 10;
  }

  // Información importante
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(180, 0, 0);
  doc.text('Información Importante', 20, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Todas las personas deben:', 20, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  const infoLines = [
    'Presentar documento de identificación en físico (incluyendo menores de edad y extranjeros).',
    'Los menores de edad deben presentar autorización firmada por los padres si no vienen acompañados.',
    '',
    'Quien se presente al Hotel indocumentado no podrá hospedarse bajo ninguna circunstancia.',
    '',
    'Horario de Check-in: a partir de las 15:00 hrs',
    'Horario de Check-out: 13:00 hrs',
    '',
    '* Late Check Out: (salida posterior al horario establecido sin previo aviso)',
    '  se cobrará el 50% de la tarifa otorgada.',
    '* La utilización parcial del día de alojamiento causa el pago de la tarifa completa.',
    '* El huésped asume y se responsabiliza de todo daño material, pérdida de lencería,',
    '  objetos de adorno del alojamiento y de los daños ocasionados por sus acompañantes.',
  ];

  infoLines.forEach((line) => {
    doc.text(line, 20, y);
    y += 5;
  });

  y += 10;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`Total: ${formatCurrency(reservation.totalAmount)}`, pageWidth - 20, y, {
    align: 'right',
  });

  doc.save(`Reserva-Multi-${reservation.reservationCode}.pdf`);
}

export function generateReservationPdf(reservation: ReservationPdfData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header - Título del hotel
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Hotel Manager', 20, y);

  // Título Reserva
  doc.setFontSize(24);
  doc.setTextColor(180, 0, 0);
  doc.text('Reserva', pageWidth - 20, y, { align: 'right' });

  y += 15;

  // Información del hotel
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestión Hotelera', 20, y);

  // Número de reserva y fecha
  doc.text(`No ${reservation.reservationCode}`, pageWidth - 20, y, { align: 'right' });
  y += 5;
  doc.text(
    `Fecha: ${new Date(reservation.createdAt).toLocaleDateString('es-ES')}`,
    pageWidth - 20,
    y,
    { align: 'right' },
  );

  y += 15;

  // Información del cliente
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${reservation.customer.firstName} ${reservation.customer.lastName}`, 50, y);

  // Fecha de expiración (check-out)
  doc.text(`Fecha de expiración: ${formatDate(reservation.checkOutDate)}`, pageWidth - 20, y, {
    align: 'right',
  });

  y += 6;

  if (reservation.customer.documentType && reservation.customer.documentNumber) {
    doc.text(`${reservation.customer.documentType}: ${reservation.customer.documentNumber}`, 20, y);
    y += 6;
  }

  if (reservation.customer.phone) {
    doc.text(`TEL: ${reservation.customer.phone}`, 20, y);
    y += 6;
  }

  if (reservation.customer.email) {
    doc.text(`Correo: ${reservation.customer.email}`, 20, y);
    y += 6;
  }

  doc.text(`Fecha inicio de servicio: ${formatDate(reservation.checkInDate)}`, 20, y);

  y += 15;

  // Tabla de información de reserva
  const tableX = 20;
  const tableWidth = pageWidth - 40;
  const colWidths = [12, 50, 25, 30, 30, tableWidth - 147]; // Ítem estrecho, Estado usa el resto
  const headers = ['Ítem', 'Habitación', 'Huéspedes', 'Check-in', 'Check-out', 'Estado'];
  const rowHeight = 12;

  // Encabezado de la tabla
  doc.setFillColor(240, 240, 240);
  doc.rect(tableX, y - 4, tableWidth, rowHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  let xPos = tableX + 2;
  for (let i = 0; i < headers.length; i++) {
    const cellWidth = colWidths[i];
    const header = headers[i];
    if (cellWidth !== undefined && header !== undefined) {
      const textWidth = doc.getTextWidth(header);
      const centeredX = xPos + (cellWidth - textWidth) / 2;
      doc.text(header, centeredX, y + 2);
      xPos += cellWidth;
    }
  }

  y += rowHeight;

  // Datos de la tabla
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  const rowData = [
    '1',
    `${reservation.room.number} (${getRoomTypeLabel(reservation.room.type)})`,
    `${reservation.adults + reservation.children}`,
    formatShortDate(reservation.checkInDate),
    formatShortDate(reservation.checkOutDate),
    getStatusLabel(reservation.status),
  ];

  xPos = tableX + 2;
  for (let i = 0; i < rowData.length; i++) {
    const cellWidth = colWidths[i];
    const data = rowData[i];
    if (cellWidth !== undefined && data !== undefined) {
      const textWidth = doc.getTextWidth(data);
      const centeredX = xPos + (cellWidth - textWidth) / 2;
      doc.text(data, centeredX, y + 2);
      xPos += cellWidth;
    }
  }

  // Bordes de la tabla
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);

  // Borde exterior
  doc.rect(tableX, y - rowHeight - 4, tableWidth, rowHeight * 2 + 4);

  // Línea separadora entre encabezado y datos
  doc.line(tableX, y - 4, tableX + tableWidth, y - 4);

  // Líneas verticales de las columnas
  let lineX = tableX;
  for (let i = 0; i < colWidths.length - 1; i++) {
    const width = colWidths[i];
    if (width !== undefined) {
      lineX += width;
      doc.line(lineX, y - rowHeight - 4, lineX, y + rowHeight);
    }
  }

  y += rowHeight + 10;

  // Detalles de la reservación
  const nights = calculateNights(reservation.checkInDate, reservation.checkOutDate);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Detalles de la Reservación', 20, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  doc.text(
    `• Habitación ${reservation.room.number} - ${getRoomTypeLabel(reservation.room.type)}`,
    20,
    y,
  );
  y += 6;
  doc.text(`• ${reservation.adults} adulto(s), ${reservation.children} niño(s)`, 20, y);
  y += 6;
  doc.text(`• ${nights} noche(s) de alojamiento`, 20, y);

  if (reservation.notes) {
    y += 6;
    doc.text(`• Notas: ${reservation.notes}`, 20, y);
  }

  y += 15;

  // Información importante
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(180, 0, 0);
  doc.text('Información Importante', 20, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Todas las personas deben:', 20, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  const infoLines = [
    'Presentar documento de identificación en físico (incluyendo menores de edad y extranjeros).',
    'Los menores de edad deben presentar autorización firmada por los padres si no vienen acompañados.',
    '',
    'Quien se presente al Hotel indocumentado no podrá hospedarse bajo ninguna circunstancia.',
    '',
    'Horario de Check-in: a partir de las 15:00 hrs',
    'Horario de Check-out: 13:00 hrs',
    '',
    '* Late Check Out: (salida posterior al horario establecido sin previo aviso)',
    '  se cobrará el 50% de la tarifa otorgada.',
    '* La utilización parcial del día de alojamiento causa el pago de la tarifa completa.',
    '* El huésped asume y se responsabiliza de todo daño material, pérdida de lencería,',
    '  objetos de adorno del alojamiento y de los daños ocasionados por sus acompañantes.',
  ];

  infoLines.forEach((line) => {
    doc.text(line, 20, y);
    y += 5;
  });

  y += 10;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`Total: ${formatCurrency(reservation.totalAmount)}`, pageWidth - 20, y, {
    align: 'right',
  });

  // Guardar el PDF
  doc.save(`Reserva-${reservation.reservationCode}.pdf`);
}
