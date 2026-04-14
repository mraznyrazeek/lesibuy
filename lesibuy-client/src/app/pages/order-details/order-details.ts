import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetails implements OnInit {
  order: Order | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Invalid order id.';
      return;
    }

    this.loadOrder(id);
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.orderService.getOrderById(id).subscribe({
      next: (data) => {
        this.order = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load order details:', err);
        this.errorMessage = 'Failed to load order details.';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  canCancelOrder(): boolean {
    return (this.order?.status || '').toLowerCase() === 'pending';
  }

  canDownloadInvoice(): boolean {
    return (this.order?.status || '').toLowerCase() === 'approved';
  }

  cancelOrder(): void {
    if (!this.order) return;

    Swal.fire({
      title: 'Cancel Order?',
      text: 'Are you sure you want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it',
      cancelButtonText: 'No',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (!result.isConfirmed || !this.order) return;

      this.orderService.cancelOrder(this.order.id).subscribe({
        next: () => {
          this.order!.status = 'Cancelled';

          Swal.fire({
            icon: 'success',
            title: 'Cancelled',
            text: 'Your order has been cancelled successfully.'
          });
        },
        error: (err) => {
          console.error(err);

          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: 'Failed to cancel order.'
          });
        }
      });
    });
  }

  parseSpecifications(specifications?: string): { key: string; value: string }[] {
    if (!specifications) return [];

    try {
      const parsed = JSON.parse(specifications);
      return Object.keys(parsed).map(key => ({
        key: this.formatKey(key),
        value: parsed[key]
      }));
    } catch (error) {
      console.error('Invalid specifications JSON', error);
      return [];
    }
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase())
      .trim();
  }

  formatCurrency(value: number): string {
    return `Rs. ${value.toFixed(2)}`;
  }

  getBillingAddressText(): string {
    if (!this.order) return '-';

    if (this.order.billingSameAsShipping) {
      return `${this.order.shippingAddress}, ${this.order.shippingCity}, ${this.order.shippingPostalCode}`;
    }

    return `${this.order.billingAddress || '-'}, ${this.order.billingCity || '-'}, ${this.order.billingPostalCode || '-'}`;
  }

  private addWrappedText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight = 4.5
  ): number {
    const lines = doc.splitTextToSize(text || '-', maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  }

  downloadInvoice(): void {
    if (!this.order || !this.canDownloadInvoice()) {
      return;
    }

    const order = this.order;
    const doc = new jsPDF('p', 'mm', 'a4');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;

    const orderDate = new Date(order.createdAt);
    const invoiceDate = orderDate.toLocaleDateString('en-GB');
    const invoiceTime = orderDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let y = 12;

    doc.setFillColor(234, 179, 8);
    doc.roundedRect(margin, y, contentWidth, 4, 2, 2, 'F');
    y += 8;

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, contentWidth, 26, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text('LESIBUY', margin + 6, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Official Customer Invoice', margin + 6, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('INVOICE', pageWidth - margin - 6, y + 8, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Invoice No: INV-${order.id}`, pageWidth - margin - 6, y + 14, { align: 'right' });
    doc.text(`Order No: #${order.id}`, pageWidth - margin - 6, y + 19, { align: 'right' });
    doc.text(`Issued: ${invoiceDate} ${invoiceTime}`, pageWidth - margin - 6, y + 24, { align: 'right' });

    y += 33;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 12, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`Status: ${order.status}`, margin + 5, y + 7.5);
    doc.text(`Payment Method: ${order.paymentMethod || 'Cash on Delivery'}`, pageWidth - margin - 5, y + 7.5, {
      align: 'right'
    });

    y += 16;

    const leftX = margin;
    const rightX = margin + (contentWidth / 2) + 3;
    const boxWidth = (contentWidth / 2) - 3;
    const boxHeight = 34;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(leftX, y, boxWidth, boxHeight, 3, 3, 'FD');
    doc.roundedRect(rightX, y, boxWidth, boxHeight, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Customer Details', leftX + 5, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(`Name: ${order.fullName || '-'}`, leftX + 5, y + 14);
    doc.text(`Email: ${order.email || '-'}`, leftX + 5, y + 20);
    doc.text(`Phone: ${order.phone || '-'}`, leftX + 5, y + 26);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Address Details', rightX + 5, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    let rightTextY = y + 14;
    rightTextY = this.addWrappedText(
      doc,
      `Shipping: ${order.shippingAddress}, ${order.shippingCity}, ${order.shippingPostalCode}`,
      rightX + 5,
      rightTextY,
      boxWidth - 10,
      4.2
    );

    this.addWrappedText(
      doc,
      `Billing: ${this.getBillingAddressText()}`,
      rightX + 5,
      rightTextY + 1,
      boxWidth - 10,
      4.2
    );

    y += boxHeight + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Ordered Items', margin, y);

    y += 3;

    autoTable(doc, {
      startY: y + 1,
      margin: { left: margin, right: margin },
      head: [['Product', 'Description', 'Qty', 'Unit Price', 'Subtotal']],
      body: order.items.map(item => [
        item.productName,
        item.productDescription || '-',
        String(item.quantity),
        this.formatCurrency(item.unitPrice),
        this.formatCurrency(item.subTotal)
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [15, 23, 42],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        valign: 'middle'
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 2.2
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 78 },
        2: { cellWidth: 12, halign: 'center' },
        3: { cellWidth: 28, halign: 'right' },
        4: { cellWidth: 28, halign: 'right' }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 5;

    order.items.forEach(item => {
      const specs = this.parseSpecifications(item.specifications);
      if (!specs.length) return;
      if (y > 220) return;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Specifications - ${item.productName}`, margin, y);

      y += 4;

      const specRows: string[][] = [];
      for (let i = 0; i < specs.length; i += 2) {
        const left = `${specs[i].key}: ${specs[i].value}`;
        const right = specs[i + 1] ? `${specs[i + 1].key}: ${specs[i + 1].value}` : '';
        specRows.push([left, right]);
      }

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        body: specRows,
        theme: 'grid',
        styles: {
          fontSize: 8,
          textColor: [51, 65, 85],
          lineColor: [226, 232, 240],
          lineWidth: 0.2,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 88 },
          1: { cellWidth: 88 }
        }
      });

      y = (doc as any).lastAutoTable.finalY + 5;
    });

    const totalBoxW = 62;
    const totalBoxH = 24;
    const totalBoxX = pageWidth - margin - totalBoxW;
    const totalBoxY = Math.min(y, 226);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(totalBoxX, totalBoxY, totalBoxW, totalBoxH, 3, 3, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Items:', totalBoxX + 4, totalBoxY + 7);
    doc.text(String(order.items.length), totalBoxX + totalBoxW - 4, totalBoxY + 7, { align: 'right' });

    doc.text('Status:', totalBoxX + 4, totalBoxY + 13);
    doc.text(order.status, totalBoxX + totalBoxW - 4, totalBoxY + 13, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Total:', totalBoxX + 4, totalBoxY + 20);
    doc.text(this.formatCurrency(order.totalAmount), totalBoxX + totalBoxW - 4, totalBoxY + 20, { align: 'right' });

    const footerY = pageHeight - 30;

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Issued by LesiBuy', margin, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Email: mraznyrazeek@gmail.com', margin, footerY + 5);
    doc.text('Phone: +44 7727 019730', margin, footerY + 10);
    doc.text('Address: 139 North Station Road,', margin, footerY + 15);
    doc.text('Colchester, Essex, CO1 1UX', margin, footerY + 20);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'This invoice was generated electronically by LesiBuy and serves as the official order summary for this purchase.',
      pageWidth - margin,
      footerY + 10,
      {
        align: 'right',
        maxWidth: 80
      }
    );

    doc.save(`LesiBuy-Invoice-Order-${order.id}.pdf`);
  }
}