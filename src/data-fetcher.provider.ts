import {Init, ProviderBase} from '@netjam/server';
import {Moment}             from 'moment';

export interface IService {
    name: string,
    id: string,
    data: {
        [key: string]: string | number
    }
}

export class DataFetcherProvider extends ProviderBase {
    private readonly interval: number = 5000;

    private self: IService[] = [];
    private services: {
        [key: string]: IService[],
    } = {};

    @Init
    async init() {
        setInterval(async () => {
            await this.gatherData();
        }, this.interval);
    }

    async gatherData() {
        const data: [string, string[]] = await new Promise((resolve) => this.netjam.getRedisClient().ioClient
                                                                            .scan('0', 'MATCH', 'nj_service::*', 'COUNT', '500', (err, data) => {
                                                                                if (err) console.error(err);
                                                                                resolve(data);
                                                                            }));
        const {self, services} = await this.parseRKeys(data);

        this.self = self;
        this.services = services;
    }

    private async parseRKeys(data: [string, string[]]): Promise<{ self: IService[], services: { [key: string]: IService[] } }> {
        const [_, servicesKeys] = data;
        const self: IService[] = [];
        const services: { [key: string]: IService[] } = {};

        for (let serviceKey of servicesKeys) {
            const [_, serviceName, serviceId] = serviceKey.split('::');

            const serviceData: string = await (new Promise((resolve) => this.netjam.getRedisClient().ioClient
                                                                            .get(serviceKey, (err, data) => {
                                                                                if (err) console.error(err);
                                                                                resolve(data);
                                                                            })));
            const parsedData: { [key: string]: string | number } = JSON.parse(serviceData);
            const service: IService = {
                name: serviceName,
                id  : serviceId,
                data: {
                    ...parsedData,
                },
            };

            if (serviceName === this.netjam.getRedisClient().serviceName) {
                self.push(service);
            } else {
                if (!services[serviceName]) services[serviceName] = [];
                services[serviceName].push(service);
            }
        }

        return {
            self,
            services,
        };

    }

    getServiceData(withMonitoring: boolean = false) {
        return {
            totalServices: (withMonitoring ? this.self.length : 0) +
                           Object.values(this.services).reduce((arr, cur) => arr + cur.length, 0),
            services     : {
                ...this.services,
                ...(withMonitoring ? {'monitoring': this.self} : {}),
            },
        };
    }

    async getServiceDataById(id: string) {
        return {};
    }
}