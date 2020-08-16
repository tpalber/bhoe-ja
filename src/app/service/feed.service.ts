import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { Article } from '../models/article';

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  constructor(private http: HttpClient) {}

  getMockArticles(): Observable<Article[]> {
    return of(this.mockArticles);
    // return of([]);
  }

  getArticles(
    offset: number,
    startDate?: Date,
    endDate?: Date,
    searchValue?: string
  ): Observable<Article[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('offset', offset.toString());
    if (startDate) {
      params = params.set('date[$gte]', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('date[$lte]', endDate.toISOString());
    }
    if (searchValue) {
      params = params.set('title[$regex]', searchValue);
      params = params.set('title[$options]', 'i');
    }

    return this.http.get<Article[]>(`http://localhost:3000/api/articles`, {
      params: params,
    });
  }

  mockArticles: Article[] = [
    {
      title:
        'CTA urge Tibetans to observe lockdown-like precautions throughout May ',
      source: 'Phayul',
      link: 'https://www.phayul.com/2020/04/30/43268/',
      date: new Date(),
      description:
        'By Choekyi Lhamo DHARAMSHALA, Apr. 30: The Central Tibetan Administration’s President urged Tibetans to continue observing precautions after the all-India lockdown will be lifted on May 3. Dr. Lobsang Sangay urged Tibetans to refrain from travelling in order to prevent community transmission of COVID-19, throughout the next month. Cabinet minister for Home Affairs, Sonam Topgyal […]',
    },
    {
      title: 'WHO map shows parts of Ladakh under China',
      source: 'Phayul',
      link: 'https://www.phayul.com/2020/04/29/43261/',
      date: new Date(),
      description:
        'By Choekyi Lhamo DHARAMSHALA,APR 29: A World Health Organization (WHO) map has shown parts of India’s Ladakh and Jammu & Kashmir (J&K) as Chinese territory on their website. A part of Ladakh (Aksai Chin) has been shown as Chinese territory accompanied with a dotted line and colour code, and J&K and the rest of India […]',
    },
    {
      title:
        'China capitalizing on the devastation it has engineered, says CTA Information Secretary',
      source: 'Tibet Post',
      link: 'https://www.phayul.com/2020/04/28/43253/',
      date: new Date(),
      description:
        'By Tenzin Dharpo DHARAMSHALA, Apr. 28: The global Covid-19 pandemic that originated in Wuhan, China has become a “Trojan horse” to “global hegemony” for the Chinese government, the Secretary for the exile Tibetan government’s information and international relation wing, Tsewang Gyalpo Arya said Monday. “Even after all the chaos and pandemic it has created, China […]',
    },
    {
      title:
        'Sweden shuts down its last Confucius classroom amid deteriorating relations',
      source: 'Phayul',
      link: 'https://www.phayul.com/2020/04/28/43250/',
      date: new Date(),
      description:
        'By Choekyi Lhamo DHARAMSHALA, APR 28: The Swedish government has decided to shut down its last Confucius teaching program amid concerns over Beijing’s attempt to disseminate propaganda and restrict academic freedom through these set-ups. Sweden has now become the first European nation to close all Chinese state-sponsored teaching programs which were established to promote Chinese […]',
    },
    {
      title: 'Testing Title',
      source: 'Tibet Post',
      link: 'https://www.phayul.com/2020/04/28/43250/',
      date: new Date(),
      description: undefined,
    },
  ];
}
