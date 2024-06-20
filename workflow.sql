-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 19 juin 2024 à 20:41
-- Version du serveur : 5.7.36
-- Version de PHP : 7.4.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `workflow`
--

-- --------------------------------------------------------

--
-- Structure de la table `close`
--

DROP TABLE IF EXISTS `close`;
CREATE TABLE IF NOT EXISTS `close` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `titre` varchar(150) NOT NULL,
  `description` varchar(150) NOT NULL,
  `userID` varchar(100) NOT NULL,
  `etat` varchar(100) NOT NULL,
  `destinataire` varchar(255) NOT NULL,
  `date` timestamp NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `close`
--

INSERT INTO `close` (`id`, `titre`, `description`, `userID`, `etat`, `destinataire`, `date`) VALUES
(1, 'gdgfdgfdg', 'gfdgfdgdfg', '1', 'non valider', '1', '2024-06-19 20:15:39'),
(2, 'togo', 'dh', '1', 'non valider', '1', '2024-06-19 20:28:50');

-- --------------------------------------------------------

--
-- Structure de la table `requete`
--

DROP TABLE IF EXISTS `requete`;
CREATE TABLE IF NOT EXISTS `requete` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titre` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `raison` text NOT NULL,
  `statut` varchar(100) NOT NULL,
  `id_sub` varchar(255) NOT NULL,
  `destinataire` varchar(255) NOT NULL,
  `etat` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(200) NOT NULL,
  `prenom` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `pswd` varchar(200) NOT NULL,
  `statut` int(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `nom`, `prenom`, `email`, `pswd`, `statut`) VALUES
(1, 'AGBEKPONOU', 'freev', 'footbob60@gmail.com', '1234', 0),
(2, 'admin', 'admin', 'admin', 'admin', 909),
(5, 'toto', 'samson', 'footbob60@gmail.com', '1234', 2),
(6, 'frod', 'fonce', 'footbob60@gmail.com', '1234', 1);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
