import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { KrediService } from './kredi.service';
import { Kredi } from './kredi';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Ticari Krediler Ödeme Planı';
  currentDate: string = '';

  kredis: Kredi[] = [];
  newKredi: Kredi = {
    krediTutari: 0,
    vade: 0,
    faizOrani: 0,
    faizTutari: 0,
    kalanTutar: 0,
    id: 0,
    bsmv: 0,
    kkdf: 0,
    anaPara: 0,
    kalanAnaPara: 0,
    taksitTutari: 0,
    toplamBsmv: 0,
    toplamKkdf: 0,
    taksitTarihleri: []
  };

  constructor(private krediService: KrediService) {}

  ngOnInit(): void {
    this.getKredi();
    this.getCurrentDate(0); 
  }

  getKredi(): void {
    this.krediService.getKredi().subscribe(
      (response: Kredi[]) => {
        this.kredis = response;
      },
      (error: HttpErrorResponse) => {
        console.error(error.message);
      }
    );
  }

  onAddKredi(addForm: NgForm): void {
    if (addForm.invalid) {
      return;
    }
  
    const taksitSayisi = this.newKredi.vade;
    const taksitTarihleri: string[] = [];
  
    for (let i = 0; i < taksitSayisi; i++) {
      const taksitTarihi = this.getCurrentDate(i);
      taksitTarihleri.push(taksitTarihi);
    }
  
    this.newKredi.taksitTarihleri = taksitTarihleri;
  
    this.krediService.taksitEkle(this.newKredi).subscribe(
      (response: Kredi[]) => {
        console.log(response);
        // Temizleme işlemi burada yapılıyor
        this.kredis = [];
        // Yeni krediyi listeye ekliyoruz
        this.kredis.push(...response);
        addForm.reset();
      },
      (error: HttpErrorResponse) => {
        console.error(error.message);
        addForm.reset();
      }
    );
  }
  
  getCurrentDate(monthsToAdd: number): string {
    const today = new Date();
    today.setMonth(today.getMonth() + monthsToAdd);

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    };

    return today.toLocaleDateString('tr-TR', options);
  }


  
exportToExcel(): void {
  const data: any[] = this.kredis.map((kredi, i) => ({
    'Taksit No': i + 1,
    'Taksit Tarihi': this.newKredi.taksitTarihleri[i] || '', // eğer taksitTarihleri dizisi yeterli değilse boş bir string kullan
    'Taksit Tutarı': kredi.taksitTutari,
    'Anapara': kredi.anaPara,
    'Faiz': kredi.faizTutari,
    'BSMV': kredi.bsmv,
    'KKDF': kredi.kkdf,
    'Kalan Anapara': kredi.kalanAnaPara
  }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveExcelFile(excelBuffer, 'kredi_tablosu.xlsx');
  }

  saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}
