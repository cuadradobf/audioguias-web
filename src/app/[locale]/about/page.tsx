import Link from "next-intl/link";

export default function About() {
    return (
      <div>
        <h2 className="defaultTitle">About</h2>
        <div className="lex flex-wrap -mx-3 mb-6 px-6">
          <p>AudioGuias es una aplicación web que permite a los usuarios crear y compartir guías de audio para lugares turísticos.</p>
          <p>Esta aplicación ha sido desarrollada por:</p>
          <p>Francisco Cuadrado</p>
        </div>
        <Link className="defaultButton" href="/contact">Contact us</Link>
      </div>
    ) 
  }
  