export const API_ENDPOINTS = {
    pets: {
        list: '/pets',
        create: '/pets',
        detail: (id: string) => `/pets/${id}`,
        update: (id: string) => `/pets/${id}`,
        delete: (id: string) => `/pets/${id}`,
    },
    notifications: {
        list: '/notifications',
        create: '/notifications',
        detail: (id: string) => `/notifications/${id}`,
        update: (id: string) => `/notifications/${id}`,
        delete: (id: string) => `/notifications/${id}`,
    },
    faq: {
        list: '/faq',
    },
    appointments: {
        list: '/appointments',
        create: '/appointments',
        detail: (id: string) => `/appointments/${id}`,
        update: (id: string) => `/appointments/${id}`,
        delete: (id: string) => `/appointments/${id}`,
    },
    vaccines: {
        list: '/vaccines',
        create: '/vaccines',
        detail: (id: string) => `/vaccines/${id}`,
        update: (id: string) => `/vaccines/${id}`,
        delete: (id: string) => `/vaccines/${id}`,
    },
    medications: {
        list: '/medications',
        create: '/medications',
        detail: (id: string) => `/medications/${id}`,
        update: (id: string) => `/medications/${id}`,
        delete: (id: string) => `/medications/${id}`,
    },
};
