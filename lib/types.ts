export type Customer={id:string;name:string;phone:string|null;address:string|null;tax_code:string|null;created_at:string};
export type Product={id:string;sku:string;name:string;unit:string;price:number;stock:number;created_at:string};
export type Order={
  id:string;order_no:string;customer_id:string|null;customer_name:string;customer_phone:string|null;
  customer_address:string|null;subtotal:number;discount:number;shipping_fee:number;total:number;
  status:string;note:string|null;created_at:string
};
export type OrderItem={id?:string;order_id?:string;product_id:string|null;sku:string;product_name:string;unit:string;quantity:number;unit_price:number;line_total:number};
export type CompanySettings={
  id:number; company_name:string; tagline:string|null; address:string|null; hotline:string|null;
  website:string|null; email:string|null; tax_code:string|null; bank_name:string|null;
  bank_id:string|null; bank_account:string|null; bank_holder:string|null; bank_branch:string|null;
  logo_url:string|null; warranty_note:string|null; invoice_footer:string|null;
};
