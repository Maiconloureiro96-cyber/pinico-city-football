"use client";

import { useState, useEffect } from "react";
import { Shuffle, RotateCcw, Users, Star, UserPlus, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerForm, type Player } from "@/components/player-form";
import { PlayerList } from "@/components/player-list";
import { TeamConfig } from "@/components/team-config";
import { TeamCard } from "@/components/team-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STORAGE_KEY = "pinico-city-players";
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/pinico-city-football' : '';

export function TeamSorter() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [numTeams, setNumTeams] = useState(2);
  const [playersPerTeam, setPlayersPerTeam] = useState(5);
  const [teams, setTeams] = useState<Player[][]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [activeTab, setActiveTab] = useState("cadastro");
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar jogadores do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPlayers(parsed);
      } catch (e) {
        console.error("Erro ao carregar jogadores:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Salvar jogadores no localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    }
  }, [players, isLoaded]);

  const handleAddPlayer = (player: Player) => {
    setPlayers((prev) => [...prev, player]);
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((pid) => pid !== id));
    setTeams([]);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(players.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const balancedShuffle = () => {
    const selectedPlayers = players.filter((p) => selectedIds.includes(p.id));
    const totalPlayers = selectedPlayers.length;
    
    // Calcula quantos times completos teremos e quantos jogadores sobram
    const fullTeams = Math.floor(totalPlayers / playersPerTeam);
    const remainingPlayers = totalPlayers % playersPerTeam;
    
    // Determina quantos times vamos criar (times completos + 1 se houver resto)
    const actualTeams = remainingPlayers > 0 ? Math.min(fullTeams + 1, numTeams) : Math.min(fullTeams, numTeams);
    
    // Ordena jogadores por habilidade (do maior para o menor)
    const sortedPlayers = [...selectedPlayers].sort((a, b) => b.skill - a.skill);

    // Cria os times vazios
    const newTeams: Player[][] = Array.from({ length: actualTeams }, () => []);
    const teamSkills: number[] = Array(actualTeams).fill(0);

    // Distribui jogadores usando algoritmo equilibrado
    // Preenche os times completos primeiro, depois o último com o restante
    sortedPlayers.forEach((player) => {
      // Encontra o time com menor pontuação total que ainda tem vaga
      let targetTeamIndex = -1;
      let minSkill = Infinity;

      for (let i = 0; i < actualTeams; i++) {
        // Para os primeiros times (completos), limite é playersPerTeam
        // Para o último time (se houver resto), aceita os jogadores restantes
        const isLastTeam = i === actualTeams - 1 && remainingPlayers > 0;
        const maxPlayers = isLastTeam ? remainingPlayers : playersPerTeam;
        
        if (newTeams[i].length < maxPlayers && teamSkills[i] < minSkill) {
          minSkill = teamSkills[i];
          targetTeamIndex = i;
        }
      }

      // Se encontrou um time com vaga, adiciona o jogador
      if (targetTeamIndex !== -1) {
        newTeams[targetTeamIndex].push(player);
        teamSkills[targetTeamIndex] += player.skill;
      }
    });

    return newTeams;
  };

  const handleShuffle = async () => {
    setIsShuffling(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newTeams = balancedShuffle();
    setTeams(newTeams);
    setIsShuffling(false);
  };

  const handleReset = () => {
    setTeams([]);
  };

  const handleClearAll = () => {
    setPlayers([]);
    setSelectedIds([]);
    setTeams([]);
  };

  const totalSlots = numTeams * playersPerTeam;
  const canShuffle = selectedIds.length >= 2; // Mínimo 2 jogadores para sortear
  
  // Calcula a distribuição dos jogadores
  const fullTeamsCount = Math.min(Math.floor(selectedIds.length / playersPerTeam), numTeams);
  const remainingPlayersCount = selectedIds.length - (fullTeamsCount * playersPerTeam);
  const hasIncompleteTeam = remainingPlayersCount > 0 && fullTeamsCount < numTeams;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Centralizado */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center">
            <img
              src={`${BASE_PATH}/logo-pinico-city.png`}
              alt="Pinico City FC"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-lg mb-3"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              Pinico City FC
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sorteio de Times Equilibrados
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="cadastro" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Cadastrar</span> Jogadores
            </TabsTrigger>
            <TabsTrigger value="sorteio" className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              <span className="hidden sm:inline">Sortear</span> Times
            </TabsTrigger>
          </TabsList>

          {/* Aba de Cadastro */}
          <TabsContent value="cadastro" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Cadastrar Jogadores
                  </CardTitle>
                  {players.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-destructive hover:text-destructive"
                    >
                      Limpar Todos
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Total cadastrados: {players.length} jogadores
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <PlayerForm onAddPlayer={handleAddPlayer} />
                <PlayerList
                  players={players}
                  selectedIds={[]}
                  onRemovePlayer={handleRemovePlayer}
                  onToggleSelect={() => {}}
                  onSelectAll={() => {}}
                  onDeselectAll={() => {}}
                  selectionMode={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Sorteio */}
          <TabsContent value="sorteio" className="space-y-6">
            {/* Configuracao */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Configuracao dos Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TeamConfig
                  numTeams={numTeams}
                  playersPerTeam={playersPerTeam}
                  onNumTeamsChange={setNumTeams}
                  onPlayersPerTeamChange={setPlayersPerTeam}
                />
                <div className="text-sm text-muted-foreground mt-3 space-y-1">
                  <p>
                    Selecionados:{" "}
                    <span className="font-medium text-foreground">{selectedIds.length}</span> jogadores
                  </p>
                  {selectedIds.length >= 2 && (
                    <p className="text-cyan-400">
                      {fullTeamsCount > 0 && (
                        <span>{fullTeamsCount} time{fullTeamsCount > 1 ? 's' : ''} completo{fullTeamsCount > 1 ? 's' : ''} ({playersPerTeam} jogadores)</span>
                      )}
                      {hasIncompleteTeam && (
                        <span>{fullTeamsCount > 0 ? ' + ' : ''} 1 time com {remainingPlayersCount} jogador{remainingPlayersCount > 1 ? 'es' : ''}</span>
                      )}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selecionar Jogadores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="w-5 h-5" />
                  Selecionar Jogadores para o Sorteio
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Escolha quem vai participar desta pelada
                </p>
              </CardHeader>
              <CardContent>
                {players.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum jogador cadastrado</p>
                    <Button
                      variant="link"
                      onClick={() => setActiveTab("cadastro")}
                      className="text-primary"
                    >
                      Ir para aba de cadastro
                    </Button>
                  </div>
                ) : (
                  <PlayerList
                    players={players}
                    selectedIds={selectedIds}
                    onRemovePlayer={handleRemovePlayer}
                    onToggleSelect={handleToggleSelect}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    selectionMode={true}
                  />
                )}
              </CardContent>
            </Card>

            {/* Botoes de Acao */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleShuffle}
                disabled={!canShuffle || isShuffling}
                className="flex-1 h-12 text-lg"
                size="lg"
              >
                <Shuffle className={`w-5 h-5 mr-2 ${isShuffling ? "animate-spin" : ""}`} />
                {isShuffling ? "Sorteando..." : "Sortear Times"}
              </Button>
              {teams.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="sm:w-auto h-12 bg-transparent"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Novo Sorteio
                </Button>
              )}
            </div>

            {!canShuffle && selectedIds.length > 0 && selectedIds.length < 2 && (
              <p className="text-center text-amber-500 text-sm">
                Selecione pelo menos 2 jogadores para sortear
              </p>
            )}

            {players.length > 0 && selectedIds.length === 0 && (
              <p className="text-center text-muted-foreground text-sm">
                Selecione os jogadores que vao participar do sorteio
              </p>
            )}

            {/* Resultado */}
            {teams.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                  Resultado do Sorteio
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {teams.map((teamPlayers, index) => (
                    <TeamCard
                      key={index}
                      teamNumber={index + 1}
                      players={teamPlayers}
                      color=""
                    />
                  ))}
                </div>

                {/* Estatisticas */}
                <Card className="bg-secondary/50">
                  <CardContent className="py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      {teams.map((teamPlayers, index) => {
                        const totalSkill = teamPlayers.reduce((sum, p) => sum + p.skill, 0);
                        return (
                          <div key={index}>
                            <p className="text-sm text-muted-foreground">Time {index + 1}</p>
                            <p className="text-lg font-bold">{totalSkill} pts</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-6 text-center text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <img
            src={`${BASE_PATH}/logo-pinico-city.png`}
            alt="Pinico City FC"
            className="w-10 h-10 object-contain opacity-70"
          />
          <p>Pinico City Futebol Clube - 03/11/23</p>
        </div>
      </footer>
    </div>
  );
}
