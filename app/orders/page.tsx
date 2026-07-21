"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/lib/types";
import {
  AlertTriangle,
  Eye,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

type DeleteTarget = Pick<Order, "id" | "order_no" | "customer_name">;

type Toast = {
  type: "success" | "error";
  message: string;
} | null;

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setToast({ type: "error", message: `Không tải được danh sách: ${error.message}` });
      return;
    }

    setOrders(data || []);
  }

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return orders;

    return orders.filter((order) =>
      `${order.order_no} ${order.customer_name} ${order.customer_phone || ""}`
        .toLowerCase()
        .includes(keyword),
    );
  }, [orders, query]);

  async function handleDelete() {
    if (!deleteTarget || deleting) return;

    setDeleting(true);

    // order_items dùng ON DELETE CASCADE nên sẽ được xóa cùng hóa đơn.
    const { error } = await supabase.from("orders").delete().eq("id", deleteTarget.id);

    if (error) {
      setToast({ type: "error", message: `Không thể xóa hóa đơn: ${error.message}` });
      setDeleting(false);
      return;
    }

    setOrders((current) => current.filter((order) => order.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleting(false);
    setToast({ type: "success", message: "Đã xóa hóa đơn khỏi hệ thống." });
  }

  return (
    <AuthGuard>
      <AppShell
        title="Đơn hàng"
        subtitle="Tra cứu, theo dõi và in phiếu bán hàng"
        action={
          <Link className="primary inline" href="/orders/new">
            <Plus size={18} />
            Tạo đơn
          </Link>
        }
      >
        <div className="metric-grid">
          <article className="metric-card">
            <div className="metric-icon">
              <ShoppingCart />
            </div>
            <div>
              <span>Tổng đơn hàng</span>
              <b>{orders.length}</b>
            </div>
          </article>

          <article className="metric-card success">
            <div className="metric-icon">
              <Wallet />
            </div>
            <div>
              <span>Tổng doanh thu</span>
              <b>
                {orders.reduce((total, order) => total + Number(order.total), 0).toLocaleString("vi-VN")} ₫
              </b>
            </div>
          </article>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Danh sách đơn hàng</h2>
              <p>Mở đơn để xem chi tiết hoặc in hóa đơn A5.</p>
            </div>

            <div className="search-field">
              <Search size={18} />
              <input
                placeholder="Tìm số đơn hoặc khách hàng"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table orders-table-v3">
              <thead>
                <tr>
                  <th>Số đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày tạo</th>
                  <th className="align-right">Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th className="align-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link className="order-link" href={`/orders/${order.id}`}>
                        {order.order_no}
                      </Link>
                    </td>
                    <td>
                      <b>{order.customer_name}</b>
                      <small>{order.customer_phone || ""}</small>
                    </td>
                    <td>{new Date(order.created_at).toLocaleString("vi-VN")}</td>
                    <td className="align-right">
                      <b>{Number(order.total).toLocaleString("vi-VN")} ₫</b>
                    </td>
                    <td>
                      <span className="status info-status">{order.status}</span>
                    </td>
                    <td>
                      <div className="order-row-actions">
                        <Link className="order-action-button view" href={`/orders/${order.id}`} title="Xem hóa đơn">
                          <Eye size={16} />
                          <span>Xem</span>
                        </Link>
                        <Link
                          className="order-action-button print"
                          href={`/orders/${order.id}?print=1`}
                          title="In hóa đơn"
                        >
                          <Printer size={16} />
                          <span>In</span>
                        </Link>
                        <button
                          type="button"
                          className="order-action-button delete"
                          title="Xóa hóa đơn khỏi hệ thống"
                          onClick={() =>
                            setDeleteTarget({
                              id: order.id,
                              order_no: order.order_no,
                              customer_name: order.customer_name,
                            })
                          }
                        >
                          <Trash2 size={16} />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!filtered.length && (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      Chưa có đơn hàng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {deleteTarget && (
          <div className="modal-overlay" role="presentation" onMouseDown={() => !deleting && setDeleteTarget(null)}>
            <section
              className="modal-card small delete-order-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-order-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="delete-modal-close"
                aria-label="Đóng"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                <X size={19} />
              </button>

              <div className="delete-modal-icon">
                <AlertTriangle size={25} />
              </div>

              <div className="delete-modal-content">
                <h3 id="delete-order-title">Xóa hóa đơn khỏi hệ thống?</h3>
                <p>
                  Hóa đơn <b>{deleteTarget.order_no}</b> của khách hàng <b>{deleteTarget.customer_name}</b> sẽ bị xóa
                  vĩnh viễn.
                </p>
                <strong>Hành động này không thể hoàn tác.</strong>
              </div>

              <div className="delete-modal-actions">
                <button type="button" className="secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>
                  Hủy
                </button>
                <button type="button" className="danger-button inline" disabled={deleting} onClick={handleDelete}>
                  <Trash2 size={17} />
                  {deleting ? "Đang xóa..." : "Xóa khỏi hệ thống"}
                </button>
              </div>
            </section>
          </div>
        )}

        {toast && (
          <div className={`order-toast ${toast.type}`}>
            <span>{toast.type === "success" ? "✓" : "!"}</span>
            <div>
              <b>{toast.type === "success" ? "Thành công" : "Có lỗi xảy ra"}</b>
              <p>{toast.message}</p>
            </div>
            <button type="button" aria-label="Đóng thông báo" onClick={() => setToast(null)}>
              <X size={17} />
            </button>
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}
