import React, { useEffect } from 'react'
import { Redirect, Switch, Route, useLocation } from 'react-router-dom'

import { useStateValue } from 'data/state'
import useConfig from 'utils/useConfig'
import Link from 'components/Link'

import Products from './Products'
import Collections from './Collections'
import Orders from './Orders'
import Discounts from './discounts/Discounts'
import EditDiscount from './discounts/EditDiscount'
import Order from './order/Order'
import Login from './Login'
import Settings from './settings/Settings'
import Events from './Events'

const Admin = () => {
  const { config } = useConfig()
  const { pathname } = useLocation()
  useEffect(() => {
    fetch(`${config.backend}/auth`, { credentials: 'include' }).then(
      async response => {
        if (response.status === 200) {
          const data = await response.json()
          dispatch({ type: 'setAuth', auth: data.email })
        }
      }
    )
  }, [])

  const [{ admin }, dispatch] = useStateValue()
  if (!admin) {
    return <Login />
  }
  const SiteTitle = config.fullTitle || config.title

  return (
    <div className="container admin">
      <h1 className="mb-3">{`${SiteTitle} Admin`}</h1>
      <div className="row">
        <div className="col-3">
          <h3>&nbsp;</h3>
          <div className="categories">
            <ul className="list-unstyled">
              <li
                className={
                  pathname.indexOf('/admin/orders') === 0 ? 'active' : ''
                }
              >
                <Link to="/admin/orders">Orders</Link>
              </li>
              <li className={pathname === '/admin/products' ? 'active' : ''}>
                <Link to="/admin/products">Products</Link>
              </li>
              <li className={pathname === '/admin/collections' ? 'active' : ''}>
                <Link to="/admin/collections">Collections</Link>
              </li>
              <li
                className={
                  pathname.indexOf('/admin/discounts') === 0 ? 'active' : ''
                }
              >
                <Link to="/admin/discounts">Discounts</Link>
              </li>
              <li
                className={
                  pathname.indexOf('/admin/settings') === 0 ? 'active' : ''
                }
              >
                <Link to="/admin/settings">Settings</Link>
              </li>
              <li
                className={
                  pathname.indexOf('/admin/events') === 0 ? 'active' : ''
                }
              >
                <Link to="/admin/events">Events</Link>
              </li>
              <li className="db">
                <a
                  href="#logout"
                  onClick={e => {
                    e.preventDefault()

                    fetch(`${config.backend}/auth/logout`, {
                      method: 'POST',
                      credentials: 'include'
                    }).then(async response => {
                      if (response.status === 200) {
                        dispatch({ type: 'logout' })
                      }
                    })
                  }}
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="col-9">
          <Switch>
            <Route path="/admin/discounts/:id" component={EditDiscount} />
            <Route path="/admin/discounts" component={Discounts} />
            <Route path="/admin/products" component={Products} />
            <Route path="/admin/collections" component={Collections} />
            <Route path="/admin/settings" component={Settings} />
            <Route path="/admin/events" component={Events} />
            <Route path="/admin/orders/:id" component={Order} />
            <Route path="/admin/orders" component={Orders} />
            <Redirect to="/admin/orders" />
          </Switch>
        </div>
      </div>
    </div>
  )
}

export default Admin

require('react-styl')(`
  .admin
    margin-top: 2rem
    margin-bottom: 5rem
    h1
      font-size: 24px
`)
