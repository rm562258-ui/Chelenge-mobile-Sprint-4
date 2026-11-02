import api from './client';

export function warmUpApi(): void {
    void api.get('/pets').catch(() => undefined);
}
