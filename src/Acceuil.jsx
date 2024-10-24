
import Typewriter from 'typewriter-effect';



function Acceuil() {
  return (
   <>
   <div className="min-h-full">
   <nav className="flex items-center justify-between bg-gradient-to-tr from-white to-white mt-6 ml-14">
   <Typewriter
      options={{loop:true,autoStart:true, wrapperClassName:"text-green-500 text-4xl font-bold",cursorClassName:"text-green-500 text-3xl", cursor:"🖊"}}
      onInit={(typewriter) => {
    typewriter.typeString('SECRETARIA DU SERVICE COMPTABLE CROUS DE ZIGUINCHOR')
      .pauseFor(1000)
      .deleteAll()
      .start()
      
  }}

  />
   </nav>
   </div>
   </>
  )
}

export default Acceuil