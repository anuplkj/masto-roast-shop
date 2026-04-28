create policy "Anyone can read order by id" on public.orders for select using (true);
create policy "Anyone can read order items" on public.order_items for select using (true);