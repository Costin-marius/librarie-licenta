import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const InvoiceTemplate = ({ factura, dateUser }) => {
    return (
        <div id="invoice-content" className="bg-white text-stone-900 p-10 w-[800px] mx-auto font-sans" style={{ minHeight: '1123px' }}>
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-amber-700">BookIo SRL</h2>
                    <p className="text-sm text-stone-500 mt-2">CUI: RO12345678</p>
                    <p className="text-sm text-stone-500">Reg. Com.: J40/1234/2026</p>
                    <p className="text-sm text-stone-500">Strada Literaturii Noi, Nr. 12, București</p>
                </div>
                <div className="text-right">
                    <h3 className="text-2xl font-black text-stone-800 uppercase tracking-widest">Factură Fiscală</h3>
                    <p className="text-sm font-bold mt-2">Seria: BKIO Nr: {factura._id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm">Data: {factura.createdAt ? new Date(factura.createdAt).toLocaleDateString('ro-RO') : new Date().toLocaleDateString('ro-RO')}</p>
                </div>
            </div>

            <div className="border-b-2 border-stone-200 pb-6 mb-8">
                <h3 className="text-xl font-bold text-stone-800 mb-2">CUMPĂRĂTOR</h3>
                <p className="text-base font-semibold">{factura.dateLivrare?.nume || dateUser?.nume || 'Client'}</p>
                <p className="text-base">Telefon: {factura.dateLivrare?.telefon || '-'}</p>
                <p className="text-base text-stone-600 max-w-sm">{factura.dateLivrare?.adresa || dateUser?.adresa || 'Nespecificată'}</p>
            </div>

            <div className="mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-stone-100 text-stone-700">
                            <th className="py-4 px-4 font-bold border-b-2 border-stone-200">Produs</th>
                            <th className="py-4 px-4 font-bold border-b-2 border-stone-200 text-center">Cantitate</th>
                            <th className="py-4 px-4 font-bold border-b-2 border-stone-200 text-right">Preț Unitar</th>
                            <th className="py-4 px-4 font-bold border-b-2 border-stone-200 text-right">Valoare</th>
                        </tr>
                    </thead>
                    <tbody className="text-base text-stone-800 divide-y divide-stone-100">
                        {factura.produse.map((produs, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-stone-50/50"}>
                                <td className="py-4 px-4 font-medium">{produs.titlu}</td>
                                <td className="py-4 px-4 text-center">{produs.cantitate}</td>
                                <td className="py-4 px-4 text-right">{produs.pret.toFixed(2)} lei</td>
                                <td className="py-4 px-4 text-right font-semibold">{(produs.pret * produs.cantitate).toFixed(2)} lei</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end pt-6 border-t-2 border-stone-200">
                {(() => {
                    const subtotal = factura.produse.reduce((acc, p) => acc + (p.pret * p.cantitate), 0);
                    const costTransport = factura.total - subtotal;
                    return (
                        <div className="w-1/2 space-y-3">
                            <div className="flex justify-between text-stone-600">
                                <span>Subtotal:</span>
                                <span className="font-semibold">{subtotal.toFixed(2)} lei</span>
                            </div>
                            <div className="flex justify-between text-stone-600">
                                <span>Transport:</span>
                                <span className="font-semibold">{costTransport <= 0.01 ? 'Gratuit' : `${costTransport.toFixed(2)} lei`}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-stone-900 border-t border-stone-200 pt-4 mt-2">
                                <span>Total de Plată:</span>
                                <span className="text-amber-600">{factura.total.toFixed(2)} lei</span>
                            </div>
                        </div>
                    );
                })()}
            </div>
            
            <div className="mt-20 text-center text-sm font-medium text-stone-400">
                Vă mulțumim că ați cumpărat de la BookIo!
            </div>
        </div>
    );
};

export const generateInvoicePDF = async (factura, dateUser) => {
    // 1. Container div invizibil
    const containerId = 'pdf-invoice-container';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        document.body.appendChild(container);
    }

    // 2. Randează componenta React
    const root = createRoot(container);
    root.render(<InvoiceTemplate factura={factura} dateUser={dateUser} />);

    // 3. Așteptare pentru randarea completă și încărcarea fonturilor / imaginilor
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
        const element = document.getElementById('invoice-content');
        if (!element) throw new Error("Conținutul facturii nu a putut fi găsit.");

        // 4. Capturare element ca imagine de înaltă rezoluție
        const canvas = await html2canvas(element, {
            scale: 2, 
            useCORS: true,
            logging: false,
        });

        // 5. Generare PDF (A4)
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // 6. Descărcare PDF
        const docName = `Factura_BookIo_${factura._id.slice(-6).toUpperCase()}.pdf`;
        pdf.save(docName);
    } catch (error) {
        console.error("Eroare la generarea PDF-ului:", error);
    } finally {
        // 7. Curățare DOM
        root.unmount();
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
};
