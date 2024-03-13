import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { ApiService } from '../api.service';

interface Analytics {
  month: string;
  deleteuser: number;
  updateuser: number;
  userview: number;
  adduser: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  analys: Analytics[] = [];
  chart: any;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getAllAnalysis();
  }

  getAllAnalysis(): void {
    this.apiService.getAnalysis().subscribe(
      (response: any) => {
        console.log(response);
        this.analys = response;
        this.createChart();
      },
      (error) => {
        console.error('Error occurred while fetching users:', error);
      }
    );
  }

  createChart(): void {
    const labels = this.analys.map((data) => data.month);
    const deletedData = this.analys.map((data) => data.deleteuser);
    const addedData = this.analys.map((data) => data.adduser);
    const updatedData = this.analys.map((data) => data.updateuser);
    const viewsData = this.analys.map((data) => data.userview);

    this.chart = new Chart('MyChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Deleted',
            data: deletedData,
            backgroundColor: 'red',
          },
          {
            label: 'Added',
            data: addedData,
            backgroundColor: 'green',
          },
          {
            label: 'Updated',
            data: updatedData,
            backgroundColor: 'yellow',
          },
          {
            label: 'User Views',
            data: viewsData,
            backgroundColor: 'blue',
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
  }
}
