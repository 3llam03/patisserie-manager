# 🥐 Patisserie Manager

## Lancer l'application (un seul clic)

### Prérequis
- Installer [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Démarrer
```bash
docker-compose up --build
```

### Accéder à l'application
- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:5000

### Comptes par défaut
| Utilisateur | Login | Mot de passe | Rôle |
|-------------|-------|--------------|------|
| Chef Adil | headchef | password | Chef Pâtissier |
| Ismail | ismail | password123 | Équipe |

### Arrêter
```bash
docker-compose down
```

### Arrêter et supprimer les données
```bash
docker-compose down -v
```
