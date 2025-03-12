export class Validate {
  static email(mail: string) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail);
  }

  static password(val: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(
      val,
    );
  }

  static phoneNumber(phone: string) {
    return /^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone);
  }

  static username(name: string) {
    return /^(?![_\.])(?!.*[_\.]{2})[a-zA-Z0-9._]{3,20}(?<![_\.])$/.test(name);
  }

  static notes(text: string) {
    return text.trim().split(/\s+/).length <= 200;
  }

  static review(text: string) {
    return text.trim().split(/\s+/).length <= 200;
  }

  static address(address: {
    street: string;
    communes: string;
    district: string;
    city: string;
    country: string;
  }) {
    return (
      this.validateField(address.street, 100) &&
      this.validateField(address.communes, 50) &&
      this.validateField(address.district, 50) &&
      this.validateField(address.city, 50) &&
      this.validateField(address.country, 50)
    );
  }

  private static validateField(field: string, maxLength: number) {
    return (
      field !== undefined &&
      field.trim().length > 0 &&
      field.length <= maxLength
    );
  }
}
