export class EmailNotFoundError extends Error {
    constructor() {
        super('Email not found');
        this.name = 'EmailNotFoundError';
    }
}

export class EmailAlreadyExistsError extends Error {
    constructor() {
        super('Email already exists');
        this.name = 'EmailAlreadyExistsError';
    }
}

export class InvalidPasswordError extends Error {
    constructor() {
        super('Invalid password');
        this.name = 'InvalidPasswordError';
    }
}

export class DoctorNotFoundError extends Error {
    constructor() {
        super('Doctor not found');
        this.name = 'DoctorNotFoundError';
    }
}
