// components/Navbar.tsx
import { NavButtons } from './NavButtons'
import { Categories } from './Categories'

const Navbar = () => {
  return (
    <nav className="mx-auto w-full shadow-md">
      <div className="container mx-auto px-2">
        <NavButtons />
      </div>
      <Categories />
    </nav>
  )
}

export default Navbar