import { GetServerSideProps } from "next";
import Image from 'next/image'
import appPreviewImg from '../assets/app-nlw-copa-preview.png'
import logoImg from '../assets/logo.svg'
import usersAvatar from '../assets/users-avatars.png'
import iconCheck from '../assets/icon-check.svg'
import { api } from "../lib/axios";
import { FormEvent, useState } from "react";

interface HomeProps {
  poolCount: number
  guessesCount: number
  userCount: number
}

interface ICount {
  count: number
}

export default function Home({ poolCount, guessesCount, userCount }: HomeProps) {
  const [poolTitle, setPoolTitle] = useState('')

  async function handleCreatePool(event: FormEvent) {
    event.preventDefault()

    try {
      const response = await api.post('pools', {
        title: poolTitle,
      })
      

      const { code } = response.data

      await navigator.clipboard.writeText(code)
      alert('Bolão criado com sucesso, Código copiado para área de transferência!')
      setPoolTitle('')
    } catch (error) {
      alert('Falha ao criar o bolão')
    }
  }

  return (
    <div className="max-w-[1324px] h-screen mx-auto grid grid-cols-2 gap-24 items-center">
      <main>
        <Image src={logoImg} alt="NLW Copa" />
        <h1 className="mt-10 text-white text-4xl font-bold leading-tight">
          Crie seu próprio bolão da copa e compartilhe entre amigos!
        </h1>

        <div className="mt-6 flex items-center gap-2">
          <Image src={usersAvatar} alt="avatars de usuarios" />
          <strong className="text-gray-100 text-xl">
            <span className="text-ignite-500">+{userCount}</span> pessoas já estão usando
          </strong>
        </div>

        <form onSubmit={handleCreatePool} className="mt-6 flex gap-2">
          <input
            type="text"
            required placeholder="Qual o nome do seu bolão?"
            className="flex-1 px-6 py-4 rounded bg-gray-800 border border-gray-600 text-sm text-gray-100"
            onChange={(event) => setPoolTitle(event.target.value)}
            value={poolTitle}
          />
          <button type="submit" className="bg-yellow-500 px-6 py-4 rounded text-gray-900 font-bold text-sm uppercase hover:bg-yellow-700">
            Criar meu bolão
          </button>
        </form>

        <p className="mt-2 text-sm text-gray-300 leading-relaxed">
          Após criar seu bolão, você receberá um código único que poderá usar para convidar outras pessoas
        </p>

        <div className="mt-6 pt-6 border-t border-gray-600 flex items-center justify-between text-gray-100">
          <div className="flex items-center gap-6">
            <Image src={iconCheck} alt="" />
            <div className="flex flex-col">
              <span className="font-bold text-2xl">+{poolCount}</span> 
              <span>Bolões criados</span>
            </div>
          </div>

          <div className="w-px h-14 bg-gray-600"></div>

          <div className="flex items-center gap-6">
            <Image src={iconCheck} alt="" />
            <div className="flex flex-col">
              <span className="font-bold text-2xl">+{guessesCount}</span> 
              <span>Palpites enviados</span>
            </div>
          </div>
        </div>
      </main>

      <Image
        src={appPreviewImg}
        alt="dois telefones exibindo prévia da aplicação movél"
        quality={100}
      />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const [poolCountResponse, poolGuessesResponse, userCountResponse] = await Promise.all([
    api.get<ICount>('pools/count'),
    api.get<ICount>('guesses/count'),
    api.get<ICount>('users/count')
  ])

  return {
    props: {
      poolCount: poolCountResponse.data.count,
      guessesCount: poolGuessesResponse.data.count,
      userCount: userCountResponse.data.count
    }
  }
}
