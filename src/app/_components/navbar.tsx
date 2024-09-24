// components/Navbar.tsx
import { NavButtons } from './NavButtons'
import { Categories } from './Categories'
import {Divider} from "@nextui-org/react";

const Navbar = () => {
  return (
    <nav className="mx-auto w-full shadow-md">
      <div className="container mx-auto px-2">
        <NavButtons />
      </div>
      <Divider className="my-1" />
      <Categories />
    </nav>
  )
}

export default Navbar